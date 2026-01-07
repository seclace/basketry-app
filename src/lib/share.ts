// Copyright 2026 Vadim Goldenko
// SPDX-License-Identifier: Apache-2.0

import type { SharePayload } from './types';
import {
	createItem,
	createList,
	ensureCategory,
	ensureProduct,
	ensureUnit,
	getCategories,
	getItemsByList,
	getList,
	getProducts,
	getUnits
} from './db';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type CompactPayload = [
	1,
	string,
	string[],
	Array<[number, number, number, number, number, number, number]>
];

const toBase64Url = (bytes: Uint8Array) => {
	let binary = '';
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (input: string) => {
	let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4 !== 0) base64 += '=';
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
};

const compress = async (input: Uint8Array) => {
	if (typeof CompressionStream === 'undefined') return input;
	const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('deflate-raw'));
	const buffer = await new Response(stream).arrayBuffer();
	return new Uint8Array(buffer);
};

const decompress = async (input: Uint8Array) => {
	if (typeof DecompressionStream === 'undefined') return null;
	const stream = new Blob([input]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
	const buffer = await new Response(stream).arrayBuffer();
	return new Uint8Array(buffer);
};

const buildCompactPayload = (payload: SharePayload): CompactPayload => {
	const dictionary = [''];
	const indexByValue = new Map<string, number>([['', 0]]);
	const ensureIndex = (value: string) => {
		const existing = indexByValue.get(value);
		if (existing !== undefined) return existing;
		const next = dictionary.length;
		dictionary.push(value);
		indexByValue.set(value, next);
		return next;
	};

	const items: CompactPayload[3] = payload.items.map((item) => [
		ensureIndex(item.name),
		item.quantity,
		ensureIndex(item.unit),
		ensureIndex(item.category),
		ensureIndex(item.comment || ''),
		ensureIndex(item.scope || ''),
		item.purchased ? 1 : 0
	]);

	return [1, payload.listName, dictionary, items];
};

const expandCompactPayload = (compact: CompactPayload): SharePayload | null => {
	const [version, listName, dictionary, items] = compact;
	if (version !== 1) return null;
	if (!Array.isArray(dictionary) || typeof listName !== 'string' || !Array.isArray(items))
		return null;
	if (!dictionary.every((value) => typeof value === 'string')) return null;
	for (const item of items) {
		if (!Array.isArray(item) || item.length !== 7) return null;
		if (typeof item[0] !== 'number') return null;
		if (typeof item[1] !== 'number') return null;
		if (typeof item[2] !== 'number') return null;
		if (typeof item[3] !== 'number') return null;
		if (typeof item[4] !== 'number') return null;
		if (typeof item[5] !== 'number') return null;
		if (typeof item[6] !== 'number') return null;
	}
	const lookup = (index: number) => dictionary[index] ?? '';

	return {
		version: 1,
		listName,
		items: items.map((item) => ({
			name: lookup(item[0]) || 'Item',
			quantity: item[1],
			unit: lookup(item[2]) || 'pcs',
			category: lookup(item[3]) || 'Other',
			comment: lookup(item[4]) || '',
			scope: lookup(item[5]) || '',
			purchased: item[6] === 1
		}))
	};
};

const parseSharePayloadValue = (value: unknown): SharePayload | null => {
	try {
		const parsed = value as SharePayload;
		if (parsed?.version !== 1) return null;
		if (typeof parsed.listName !== 'string') return null;
		if (!Array.isArray(parsed.items)) return null;
		for (const item of parsed.items) {
			if (typeof item.name !== 'string') return null;
			if (typeof item.quantity !== 'number') return null;
			if (typeof item.unit !== 'string') return null;
			if (typeof item.category !== 'string') return null;
			if (typeof item.comment !== 'string') return null;
			if (typeof item.scope !== 'string') return null;
			if (typeof item.purchased !== 'boolean') return null;
		}
		return parsed;
	} catch {
		return null;
	}
};

export const encodeSharePayload = async (payload: SharePayload) => {
	const compact = buildCompactPayload(payload);
	const json = JSON.stringify(compact);
	const bytes = textEncoder.encode(json);
	const compressed = await compress(bytes);
	if (compressed === bytes) {
		return json;
	}
	return `B1:${toBase64Url(compressed)}`;
};

export const decodeSharePayload = async (raw: string): Promise<SharePayload | null> => {
	if (raw.startsWith('B1:')) {
		const encoded = raw.slice(3);
		const compressed = fromBase64Url(encoded);
		const decompressed = await decompress(compressed);
		if (!decompressed) return null;
		try {
			const compact = JSON.parse(textDecoder.decode(decompressed)) as CompactPayload;
			return expandCompactPayload(compact);
		} catch {
			return null;
		}
	}

	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return expandCompactPayload(parsed as CompactPayload);
		}
		return parseSharePayloadValue(parsed);
	} catch {
		return null;
	}
};

export async function buildSharePayload(listId: string): Promise<SharePayload | null> {
	const list = await getList(listId);
	if (!list) return null;

	const [items, categories, units, products] = await Promise.all([
		getItemsByList(listId),
		getCategories(),
		getUnits(),
		getProducts()
	]);

	const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
	const unitMap = new Map(units.map((unit) => [unit.id, unit.short || unit.name]));
	const productMap = new Map(products.map((product) => [product.id, product.name]));

	return {
		version: 1,
		listName: list.name,
		items: items.map((item) => ({
			name: item.name || productMap.get(item.productId) || 'Item',
			quantity: item.quantity,
			unit: unitMap.get(item.unitId) || 'pcs',
			category: categoryMap.get(item.categoryId) || 'Other',
			comment: item.comment,
			scope: item.scope,
			purchased: item.purchased
		}))
	};
}

export async function applySharePayload(
	payload: SharePayload,
	mode: 'merge' | 'new',
	targetListId?: string
) {
	const listId =
		mode === 'merge' && targetListId ? targetListId : (await createList(payload.listName)).id;

	for (const item of payload.items) {
		const category = await ensureCategory(item.category || 'Other');
		const unit = await ensureUnit(item.unit || 'pcs');
		const product = await ensureProduct(item.name, category.id, unit.id);
		await createItem(listId, {
			productId: product.id,
			name: item.name,
			quantity: item.quantity,
			unitId: unit.id,
			categoryId: category.id,
			comment: item.comment,
			scope: item.scope,
			purchased: item.purchased
		});
	}

	return listId;
}
