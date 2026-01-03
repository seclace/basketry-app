import type { Category, Unit, Product } from './types';
import { catalogProducts } from './catalog';

export const defaultCategories: Category[] = [
	{ id: 'cat-produce', name: 'Produce' },
	{ id: 'cat-dairy', name: 'Dairy' },
	{ id: 'cat-bakery', name: 'Bakery' },
	{ id: 'cat-meat', name: 'Meat & Fish' },
	{ id: 'cat-pantry', name: 'Pantry' },
	{ id: 'cat-frozen', name: 'Frozen' },
	{ id: 'cat-household', name: 'Household' },
	{ id: 'cat-drinks', name: 'Drinks' }
];

export const defaultUnits: Unit[] = [
	{ id: 'unit-pcs', name: 'Pieces', short: 'pcs' },
	{ id: 'unit-kg', name: 'Kilograms', short: 'kg' },
	{ id: 'unit-g', name: 'Grams', short: 'g' },
	{ id: 'unit-l', name: 'Liters', short: 'l' },
	{ id: 'unit-ml', name: 'Milliliters', short: 'ml' },
	{ id: 'unit-pack', name: 'Packs', short: 'pack' }
];

export const defaultProducts: Product[] = catalogProducts.map((product) => ({
	id: product.id,
	name: product.names.en,
	categoryId: product.categoryId,
	unitId: product.unitId
}));
