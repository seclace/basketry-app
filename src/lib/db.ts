import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { defaultCategories, defaultProducts, defaultUnits } from './defaults';
import type { Category, Item, Product, ShoppingList, Unit } from './types';

interface BasketryDB extends DBSchema {
	lists: {
		key: string;
		value: ShoppingList;
	};
	categories: {
		key: string;
		value: Category;
	};
	units: {
		key: string;
		value: Unit;
	};
	products: {
		key: string;
		value: Product;
		indexes: { 'by-name': string };
	};
	items: {
		key: string;
		value: Item;
		indexes: { 'by-list': string };
	};
}

const DB_NAME = 'basketry';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BasketryDB>> | null = null;

const now = () => new Date().toISOString();

const normalize = (value: string) => value.trim().toLowerCase();

async function getDb() {
	if (!dbPromise) {
		dbPromise = openDB<BasketryDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('lists')) {
					db.createObjectStore('lists', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('categories')) {
					db.createObjectStore('categories', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('units')) {
					db.createObjectStore('units', { keyPath: 'id' });
				}
				if (!db.objectStoreNames.contains('products')) {
					const store = db.createObjectStore('products', { keyPath: 'id' });
					store.createIndex('by-name', 'name');
				}
				if (!db.objectStoreNames.contains('items')) {
					const store = db.createObjectStore('items', { keyPath: 'id' });
					store.createIndex('by-list', 'listId');
				}
			}
		});
	}

	return dbPromise;
}

export async function seedDefaults() {
	const db = await getDb();
	const categoryCount = await db.count('categories');
	const tx = db.transaction(['categories', 'units', 'products'], 'readwrite');
	if (categoryCount === 0) {
		for (const category of defaultCategories) {
			await tx.objectStore('categories').add(category);
		}
		for (const unit of defaultUnits) {
			await tx.objectStore('units').add(unit);
		}
		for (const product of defaultProducts) {
			await tx.objectStore('products').add(product);
		}
	} else {
		for (const category of defaultCategories) {
			const exists = await tx.objectStore('categories').get(category.id);
			if (!exists) await tx.objectStore('categories').add(category);
		}
		for (const unit of defaultUnits) {
			const exists = await tx.objectStore('units').get(unit.id);
			if (!exists) await tx.objectStore('units').add(unit);
		}
		for (const product of defaultProducts) {
			const exists = await tx.objectStore('products').get(product.id);
			if (!exists) await tx.objectStore('products').add(product);
		}
	}
	await tx.done;

	const listCount = await db.count('lists');
	if (listCount === 0) {
		await createList('Weekly basket');
	}
}

export async function getLists() {
	const db = await getDb();
	return db.getAll('lists');
}

export async function getList(id: string) {
	const db = await getDb();
	return db.get('lists', id);
}

export async function createList(name: string) {
	const db = await getDb();
	const list: ShoppingList = {
		id: crypto.randomUUID(),
		name,
		createdAt: now(),
		updatedAt: now()
	};
	await db.add('lists', list);
	return list;
}

export async function renameList(id: string, name: string) {
	const db = await getDb();
	const list = await db.get('lists', id);
	if (!list) return null;
	list.name = name;
	list.updatedAt = now();
	await db.put('lists', list);
	return list;
}

export async function deleteList(id: string) {
	const db = await getDb();
	const tx = db.transaction(['lists', 'items'], 'readwrite');
	await tx.objectStore('lists').delete(id);
	const items = await tx.objectStore('items').index('by-list').getAllKeys(id);
	for (const key of items) {
		await tx.objectStore('items').delete(key);
	}
	await tx.done;
}

export async function getCategories() {
	const db = await getDb();
	return db.getAll('categories');
}

export async function getUnits() {
	const db = await getDb();
	return db.getAll('units');
}

export async function getProducts() {
	const db = await getDb();
	return db.getAll('products');
}

export async function findCategoryByName(name: string) {
	const db = await getDb();
	const categories = await db.getAll('categories');
	const target = normalize(name);
	return categories.find((category) => normalize(category.name) === target) ?? null;
}

export async function findUnitByName(name: string) {
	const db = await getDb();
	const units = await db.getAll('units');
	const target = normalize(name);
	return (
		units.find((unit) => normalize(unit.name) === target || normalize(unit.short) === target) ??
		null
	);
}

export async function findProductByName(name: string) {
	const db = await getDb();
	const products = await db.getAll('products');
	const target = normalize(name);
	return products.find((product) => normalize(product.name) === target) ?? null;
}

export async function createCategory(name: string) {
	const db = await getDb();
	const category: Category = { id: crypto.randomUUID(), name };
	await db.add('categories', category);
	return category;
}

export async function createUnit(name: string, short: string) {
	const db = await getDb();
	const unit: Unit = { id: crypto.randomUUID(), name, short };
	await db.add('units', unit);
	return unit;
}

export async function createProduct(name: string, categoryId: string, unitId: string) {
	const db = await getDb();
	const product: Product = { id: crypto.randomUUID(), name, categoryId, unitId };
	await db.add('products', product);
	return product;
}

export async function getItemsByList(listId: string) {
	const db = await getDb();
	return db.getAllFromIndex('items', 'by-list', listId);
}

export async function createItem(
	listId: string,
	data: {
		productId: string;
		name: string;
		quantity: number;
		unitId: string;
		categoryId: string;
		comment?: string;
		scope?: string;
		purchased?: boolean;
	}
) {
	const db = await getDb();
	const item: Item = {
		id: crypto.randomUUID(),
		listId,
		productId: data.productId,
		name: data.name,
		quantity: data.quantity,
		unitId: data.unitId,
		categoryId: data.categoryId,
		comment: data.comment ?? '',
		scope: data.scope ?? '',
		purchased: data.purchased ?? false,
		createdAt: now(),
		updatedAt: now()
	};
	await db.add('items', item);
	return item;
}

export async function updateItem(id: string, patch: Partial<Item>) {
	const db = await getDb();
	const item = await db.get('items', id);
	if (!item) return null;
	const updated = { ...item, ...patch, updatedAt: now() };
	await db.put('items', updated);
	return updated;
}

export async function deleteItem(id: string) {
	const db = await getDb();
	await db.delete('items', id);
}

export async function toggleItem(id: string, purchased: boolean) {
	return updateItem(id, { purchased });
}

export async function ensureCategory(name: string) {
	const existing = await findCategoryByName(name);
	if (existing) return existing;
	return createCategory(name);
}

export async function ensureUnit(name: string) {
	const existing = await findUnitByName(name);
	if (existing) return existing;
	return createUnit(name, name);
}

export async function ensureProduct(name: string, categoryId: string, unitId: string) {
	const existing = await findProductByName(name);
	if (existing) return existing;
	return createProduct(name, categoryId, unitId);
}
