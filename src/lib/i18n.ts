import { derived, writable } from 'svelte/store';

export type Locale = 'en' | 'ru';

const messages = {
	en: {
		appName: 'Basketry',
		sidebarHint: 'Multiple lists, grouped by category. Tap to switch.',
		newListLabel: 'New list',
		newListPlaceholder: 'Weekend run',
		createList: 'Create list',
		open: 'Open',
		itemsCount: 'items',
		listNameLabel: 'List name',
		saveName: 'Save name',
		selectList: 'Select a list',
		shareQr: 'Share QR',
		importQr: 'Import QR',
		deleteList: 'Delete list',
		confirmDeleteList: 'Delete this list? This action cannot be undone.',
		toggleSidebar: 'Toggle sidebar',
		editItem: 'Edit item',
		addItem: 'Add item',
		productModeLabel: 'Product mode',
		existingProduct: 'Existing product',
		newProduct: 'New product',
		productLabel: 'Product',
		selectProduct: 'Select product',
		newProductName: 'New product name',
		newProductPlaceholder: 'Tomatoes',
		categoryLabel: 'Category',
		quantityLabel: 'Quantity',
		unitLabel: 'Unit',
		scopeLabel: 'Scope',
		scopePlaceholder: 'Dinner / Pantry',
		commentLabel: 'Comment',
		commentPlaceholder: 'Any notes',
		reset: 'Reset',
		addAnother: 'Add another',
		noItems: 'No items yet. Add your first one above.',
		startList: 'Create a list to start building your basket.',
		otherCategory: 'Other',
		edit: 'Edit',
		remove: 'Remove',
		shareTitle: 'Share this list',
		shareHint: 'Scan to import on another device.',
		close: 'Close',
		importTitle: 'Import list',
		foundList: 'Found',
		withItems: 'with',
		importModeLabel: 'Import mode',
		importNew: 'Create new list',
		importMerge: 'Merge into existing',
		targetList: 'Target list',
		import: 'Import',
		cancel: 'Cancel',
		scanHint: 'Point the camera at the QR code.',
		invalidQr: 'Invalid QR payload.',
		cameraError: 'Camera error.',
		language: 'Language',
		unitShort: {
			'unit-pcs': 'pcs',
			'unit-kg': 'kg',
			'unit-g': 'g',
			'unit-l': 'l',
			'unit-ml': 'ml',
			'unit-pack': 'pack'
		},
		categoryName: {
			'cat-produce': 'Produce',
			'cat-dairy': 'Dairy',
			'cat-bakery': 'Bakery',
			'cat-meat': 'Meat & Fish',
			'cat-pantry': 'Pantry',
			'cat-frozen': 'Frozen',
			'cat-household': 'Household',
			'cat-drinks': 'Drinks',
			'cat-other': 'Other'
		},
		productName: {
			'prod-milk': 'Milk',
			'prod-eggs': 'Eggs',
			'prod-bread': 'Bread',
			'prod-apples': 'Apples',
			'prod-chicken': 'Chicken',
			'prod-pasta': 'Pasta',
			'prod-icecream': 'Ice Cream',
			'prod-water': 'Water'
		}
	},
	ru: {
		appName: 'Basketry',
		sidebarHint: 'Несколько списков, сгруппированных по категориям. Нажмите для переключения.',
		newListLabel: 'Новый список',
		newListPlaceholder: 'Покупки на выходные',
		createList: 'Создать список',
		open: 'Открыть',
		itemsCount: 'позиций',
		listNameLabel: 'Название списка',
		saveName: 'Сохранить имя',
		selectList: 'Выберите список',
		shareQr: 'Поделиться QR',
		importQr: 'Импорт QR',
		deleteList: 'Удалить список',
		confirmDeleteList: 'Удалить этот список? Действие нельзя отменить.',
		toggleSidebar: 'Показать/скрыть сайдбар',
		editItem: 'Редактировать',
		addItem: 'Добавить позицию',
		productModeLabel: 'Режим товара',
		existingProduct: 'Существующий товар',
		newProduct: 'Новый товар',
		productLabel: 'Товар',
		selectProduct: 'Выберите товар',
		newProductName: 'Название товара',
		newProductPlaceholder: 'Помидоры',
		categoryLabel: 'Категория',
		quantityLabel: 'Количество',
		unitLabel: 'Ед. измерения',
		scopeLabel: 'Скоуп',
		scopePlaceholder: 'Ужин / Запасы',
		commentLabel: 'Комментарий',
		commentPlaceholder: 'Любые заметки',
		reset: 'Сбросить',
		addAnother: 'Добавить ещё',
		noItems: 'Пока нет позиций. Добавьте первую выше.',
		startList: 'Создайте список, чтобы начать покупки.',
		otherCategory: 'Другое',
		edit: 'Редактировать',
		remove: 'Удалить',
		shareTitle: 'Поделиться списком',
		shareHint: 'Отсканируйте, чтобы импортировать на другом устройстве.',
		close: 'Закрыть',
		importTitle: 'Импорт списка',
		foundList: 'Найден',
		withItems: 'с',
		importModeLabel: 'Режим импорта',
		importNew: 'Создать новый список',
		importMerge: 'Объединить с существующим',
		targetList: 'Список для объединения',
		import: 'Импортировать',
		cancel: 'Отмена',
		scanHint: 'Наведите камеру на QR-код.',
		invalidQr: 'Некорректный QR.',
		cameraError: 'Ошибка камеры.',
		language: 'Язык',
		unitShort: {
			'unit-pcs': 'шт',
			'unit-kg': 'кг',
			'unit-g': 'г',
			'unit-l': 'л',
			'unit-ml': 'мл',
			'unit-pack': 'уп'
		},
		categoryName: {
			'cat-produce': 'Овощи и фрукты',
			'cat-dairy': 'Молочное',
			'cat-bakery': 'Выпечка',
			'cat-meat': 'Мясо и рыба',
			'cat-pantry': 'Бакалея',
			'cat-frozen': 'Заморозка',
			'cat-household': 'Хозяйственное',
			'cat-drinks': 'Напитки',
			'cat-other': 'Другое'
		},
		productName: {
			'prod-milk': 'Молоко',
			'prod-eggs': 'Яйца',
			'prod-bread': 'Хлеб',
			'prod-apples': 'Яблоки',
			'prod-chicken': 'Курица',
			'prod-pasta': 'Паста',
			'prod-icecream': 'Мороженое',
			'prod-water': 'Вода'
		}
	}
} as const;

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('basketry-locale') : null;
const browserLocale =
	typeof navigator !== 'undefined' ? navigator.language.toLowerCase().slice(0, 2) : null;
const initialLocale =
	stored === 'ru' || stored === 'en'
		? stored
		: browserLocale === 'ru' || browserLocale === 'en'
			? browserLocale
			: 'ru';

export const locale = writable<Locale>(initialLocale);

locale.subscribe((value) => {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('basketry-locale', value);
	}
});

export const t = derived(locale, ($locale) => messages[$locale]);
