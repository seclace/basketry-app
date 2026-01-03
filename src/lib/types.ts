export type Id = string;

export type Timestamp = string;

export interface ShoppingList {
	id: Id;
	name: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface Category {
	id: Id;
	name: string;
}

export interface Unit {
	id: Id;
	name: string;
	short: string;
}

export interface Product {
	id: Id;
	name: string;
	categoryId: Id;
	unitId: Id;
}

export interface Item {
	id: Id;
	listId: Id;
	productId: Id;
	name: string;
	quantity: number;
	unitId: Id;
	categoryId: Id;
	comment: string;
	scope: string;
	purchased: boolean;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface ShareItem {
	name: string;
	quantity: number;
	unit: string;
	category: string;
	comment: string;
	scope: string;
	purchased: boolean;
}

export interface SharePayload {
	version: 1;
	listName: string;
	items: ShareItem[];
}
