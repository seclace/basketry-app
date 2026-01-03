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

export function parseSharePayload(raw: string): SharePayload | null {
	try {
		const parsed = JSON.parse(raw) as SharePayload;
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
}

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
