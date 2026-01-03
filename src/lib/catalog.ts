import type { Locale } from './i18n';

export interface CatalogProduct {
	id: string;
	names: Record<Locale, string>;
	categoryId: string;
	unitId: string;
	aliases?: Partial<Record<Locale, string[]>>;
}

const normalize = (value: string) => value.trim().toLowerCase();

export const catalogProducts: CatalogProduct[] = [
	{
		id: 'prod-milk',
		names: { en: 'Milk', ru: 'Молоко' },
		categoryId: 'cat-dairy',
		unitId: 'unit-l',
		aliases: { en: ['whole milk'], ru: ['молочко'] }
	},
	{
		id: 'prod-eggs',
		names: { en: 'Eggs', ru: 'Яйца' },
		categoryId: 'cat-dairy',
		unitId: 'unit-pcs',
		aliases: { en: ['egg'], ru: ['яйцо'] }
	},
	{
		id: 'prod-bread',
		names: { en: 'Bread', ru: 'Хлеб' },
		categoryId: 'cat-bakery',
		unitId: 'unit-pcs',
		aliases: { en: ['baguette'], ru: ['батон'] }
	},
	{
		id: 'prod-apples',
		names: { en: 'Apples', ru: 'Яблоки' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['apple'], ru: ['яблоко'] }
	},
	{
		id: 'prod-chicken',
		names: { en: 'Chicken', ru: 'Курица' },
		categoryId: 'cat-meat',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-pasta',
		names: { en: 'Pasta', ru: 'Паста' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['spaghetti'], ru: ['макароны'] }
	},
	{
		id: 'prod-icecream',
		names: { en: 'Ice Cream', ru: 'Мороженое' },
		categoryId: 'cat-frozen',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-water',
		names: { en: 'Water', ru: 'Вода' },
		categoryId: 'cat-drinks',
		unitId: 'unit-l'
	},
	{
		id: 'prod-banana',
		names: { en: 'Bananas', ru: 'Бананы' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['banana'], ru: ['банан'] }
	},
	{
		id: 'prod-oranges',
		names: { en: 'Oranges', ru: 'Апельсины' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['orange'], ru: ['апельсин'] }
	},
	{
		id: 'prod-lemons',
		names: { en: 'Lemons', ru: 'Лимоны' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['lemon'], ru: ['лимон'] }
	},
	{
		id: 'prod-grapes',
		names: { en: 'Grapes', ru: 'Виноград' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-pears',
		names: { en: 'Pears', ru: 'Груши' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['pear'], ru: ['груша'] }
	},
	{
		id: 'prod-mandarins',
		names: { en: 'Mandarins', ru: 'Мандарины' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['mandarin', 'tangerine'], ru: ['мандарин'] }
	},
	{
		id: 'prod-avocado',
		names: { en: 'Avocado', ru: 'Авокадо' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs'
	},
	{
		id: 'prod-kiwi',
		names: { en: 'Kiwi', ru: 'Киви' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-strawberries',
		names: { en: 'Strawberries', ru: 'Клубника' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['strawberry'], ru: ['клубник'] }
	},
	{
		id: 'prod-raspberries',
		names: { en: 'Raspberries', ru: 'Малина' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['raspberry'], ru: ['малин'] }
	},
	{
		id: 'prod-blueberries',
		names: { en: 'Blueberries', ru: 'Голубика' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['blueberry'], ru: ['голубик'] }
	},
	{
		id: 'prod-cherries',
		names: { en: 'Cherries', ru: 'Черешня' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['cherry'], ru: ['черешн'] }
	},
	{
		id: 'prod-currants',
		names: { en: 'Currants', ru: 'Смородина' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-potatoes',
		names: { en: 'Potatoes', ru: 'Картофель' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['potato'], ru: ['картоф'] }
	},
	{
		id: 'prod-onions',
		names: { en: 'Onions', ru: 'Лук' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['onion'], ru: ['лук'] }
	},
	{
		id: 'prod-garlic',
		names: { en: 'Garlic', ru: 'Чеснок' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs'
	},
	{
		id: 'prod-carrots',
		names: { en: 'Carrots', ru: 'Морковь' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['carrot'], ru: ['морков'] }
	},
	{
		id: 'prod-tomatoes',
		names: { en: 'Tomatoes', ru: 'Помидоры' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['tomato'], ru: ['томат', 'помидор'] }
	},
	{
		id: 'prod-cucumbers',
		names: { en: 'Cucumbers', ru: 'Огурцы' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['cucumber'], ru: ['огур'] }
	},
	{
		id: 'prod-bellpepper',
		names: { en: 'Bell Peppers', ru: 'Болгарский перец' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['pepper', 'bell pepper'], ru: ['перец', 'болгар'] }
	},
	{
		id: 'prod-zucchini',
		names: { en: 'Zucchini', ru: 'Кабачки' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['courgette'], ru: ['кабач'] }
	},
	{
		id: 'prod-eggplant',
		names: { en: 'Eggplant', ru: 'Баклажаны' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['aubergine'], ru: ['баклаж'] }
	},
	{
		id: 'prod-lettuce',
		names: { en: 'Lettuce', ru: 'Салат' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs'
	},
	{
		id: 'prod-cabbage',
		names: { en: 'Cabbage', ru: 'Капуста' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['kale'], ru: ['капуст'] }
	},
	{
		id: 'prod-broccoli',
		names: { en: 'Broccoli', ru: 'Брокколи' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-cauliflower',
		names: { en: 'Cauliflower', ru: 'Цветная капуста' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['cauliflower'], ru: ['цветн'] }
	},
	{
		id: 'prod-beets',
		names: { en: 'Beets', ru: 'Свекла' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg',
		aliases: { en: ['beetroot'], ru: ['свекл'] }
	},
	{
		id: 'prod-greenonion',
		names: { en: 'Green Onions', ru: 'Зелёный лук' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs',
		aliases: { en: ['spring onion'], ru: ['зеленый лук', 'зелень лук'] }
	},
	{
		id: 'prod-dill',
		names: { en: 'Dill', ru: 'Укроп' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs'
	},
	{
		id: 'prod-parsley',
		names: { en: 'Parsley', ru: 'Петрушка' },
		categoryId: 'cat-produce',
		unitId: 'unit-pcs'
	},
	{
		id: 'prod-spinach',
		names: { en: 'Spinach', ru: 'Шпинат' },
		categoryId: 'cat-produce',
		unitId: 'unit-kg'
	},
	{
		id: 'prod-pickles',
		names: { en: 'Pickles', ru: 'Огурцы соленые' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['pickled cucumbers'], ru: ['соленые огурцы', 'маринованные огурцы'] }
	},
	{
		id: 'prod-pickled-tomatoes',
		names: { en: 'Pickled Tomatoes', ru: 'Помидоры соленые' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['pickled tomatoes'], ru: ['соленые помидоры', 'маринованные помидоры'] }
	},
	{
		id: 'prod-sauerkraut',
		names: { en: 'Sauerkraut', ru: 'Квашеная капуста' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-olives',
		names: { en: 'Olives', ru: 'Оливки' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['olives', 'black olives'], ru: ['маслины'] }
	},
	{
		id: 'prod-corn-canned',
		names: { en: 'Canned Corn', ru: 'Кукуруза консервированная' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['sweet corn'], ru: ['консервированная кукуруза'] }
	},
	{
		id: 'prod-peas-canned',
		names: { en: 'Canned Peas', ru: 'Горошек консервированный' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['green peas'], ru: ['зеленый горошек'] }
	},
	{
		id: 'prod-beans-canned',
		names: { en: 'Canned Beans', ru: 'Фасоль консервированная' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-chickpeas-canned',
		names: { en: 'Canned Chickpeas', ru: 'Нут консервированный' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-tuna-canned',
		names: { en: 'Canned Tuna', ru: 'Тунец консервированный' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-sardines-canned',
		names: { en: 'Canned Sardines', ru: 'Сардины консервированные' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-salmon-canned',
		names: { en: 'Canned Salmon', ru: 'Лосось консервированный' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-tomatoes-canned',
		names: { en: 'Canned Tomatoes', ru: 'Томаты консервированные' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['canned tomato'], ru: ['помидоры консервированные'] }
	},
	{
		id: 'prod-tomato-paste',
		names: { en: 'Tomato Paste', ru: 'Томатная паста' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-mushrooms-canned',
		names: { en: 'Canned Mushrooms', ru: 'Грибы консервированные' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack'
	},
	{
		id: 'prod-jam',
		names: { en: 'Jam', ru: 'Варенье' },
		categoryId: 'cat-pantry',
		unitId: 'unit-pack',
		aliases: { en: ['marmalade'], ru: ['джем'] }
	}
];

const categoryKeywords: Record<Locale, Record<string, string[]>> = {
	en: {
		'cat-produce': ['apple', 'banana', 'tomato', 'cucumber', 'lettuce', 'berries'],
		'cat-dairy': ['milk', 'cheese', 'yogurt', 'butter', 'eggs'],
		'cat-bakery': ['bread', 'baguette', 'croissant', 'bun'],
		'cat-meat': ['chicken', 'beef', 'pork', 'fish', 'salmon'],
		'cat-pantry': ['pasta', 'rice', 'oil', 'beans', 'flour'],
		'cat-frozen': ['ice cream', 'frozen', 'pizza'],
		'cat-household': ['soap', 'paper', 'detergent', 'bag'],
		'cat-drinks': ['water', 'juice', 'cola', 'tea', 'coffee']
	},
	ru: {
		'cat-produce': ['яблок', 'банан', 'томат', 'огурц', 'салат', 'ягод'],
		'cat-dairy': ['молок', 'сыр', 'йогурт', 'масло', 'яйц'],
		'cat-bakery': ['хлеб', 'батон', 'бул', 'круассан'],
		'cat-meat': ['куриц', 'говядин', 'свин', 'рыб', 'лосос'],
		'cat-pantry': ['паста', 'макарон', 'рис', 'масло', 'фасол', 'мук'],
		'cat-frozen': ['морожен', 'заморож', 'пицц'],
		'cat-household': ['мыло', 'бумаг', 'порошок', 'пакет'],
		'cat-drinks': ['вода', 'сок', 'чай', 'кофе', 'кола']
	}
};

export function getCatalogName(product: CatalogProduct, locale: Locale) {
	return product.names[locale] ?? product.names.en;
}

export function findCatalogByName(name: string, locale: Locale) {
	const target = normalize(name);
	if (!target) return null;
	for (const product of catalogProducts) {
		const direct = normalize(getCatalogName(product, locale));
		if (direct === target) return product;
		const aliases = product.aliases?.[locale] ?? [];
		if (aliases.some((alias) => normalize(alias) === target)) return product;
	}
	return null;
}

export function suggestCatalog(name: string, locale: Locale) {
	const target = normalize(name);
	if (!target) return [];
	return catalogProducts
		.filter((product) => normalize(getCatalogName(product, locale)).includes(target))
		.slice(0, 6);
}

export function resolveCategoryForName(name: string, locale: Locale) {
	const match = findCatalogByName(name, locale);
	if (match) return match.categoryId;
	const target = normalize(name);
	if (!target) return null;
	const keywords = categoryKeywords[locale];
	for (const [categoryId, tokens] of Object.entries(keywords)) {
		if (tokens.some((token) => target.includes(token))) return categoryId;
	}
	return null;
}
