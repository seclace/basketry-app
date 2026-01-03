<script lang="ts">
import { onMount, tick } from 'svelte';
import { get } from 'svelte/store';
	import QRCode from 'qrcode';
	import { BrowserQRCodeReader } from '@zxing/browser';
import type { Category, Item, Product, ShoppingList, Unit, SharePayload } from '$lib/types';
import { locale, t } from '$lib/i18n';
import {
	createItem,
	createList,
	createProduct,
	deleteItem,
	deleteList,
	findProductByName,
	getCategories,
	getItemsByList,
	getLists,
	getProducts,
	getUnits,
	renameList,
	seedDefaults,
	toggleItem,
	updateItem
} from '$lib/db';
import { applySharePayload, buildSharePayload, parseSharePayload } from '$lib/share';
import { findCatalogByName, resolveCategoryForName, suggestCatalog } from '$lib/catalog';
import type { CatalogProduct } from '$lib/catalog';

	let lists: ShoppingList[] = [];
	let items: Item[] = [];
	let categories: Category[] = [];
	let units: Unit[] = [];
	let products: Product[] = [];
	let activeListId: string | null = null;
	let listNameInput = '';
let listTitle = '';

let formMode: 'add' | 'edit' = 'add';
let editingItemId: string | null = null;
let productName = '';
let quantity = 1;
let unitId = '';
let categoryId = '';
let comment = '';
let scope = '';
let suggestions: CatalogProduct[] = [];
let showSuggestions = false;

	let exportDialog: HTMLDialogElement | null = null;
	let importDialog: HTMLDialogElement | null = null;
	let qrDataUrl = '';
	let scanError = '';
	let pendingPayload: SharePayload | null = null;
	let importMode: 'new' | 'merge' = 'new';
	let mergeTargetId = '';
	let videoEl: HTMLVideoElement | null = null;
	let scanner: BrowserQRCodeReader | null = null;

	const resetForm = () => {
		formMode = 'add';
		editingItemId = null;
		productName = '';
		quantity = 1;
		unitId = units[0]?.id ?? '';
		categoryId = categories[0]?.id ?? '';
		comment = '';
		scope = '';
		suggestions = [];
		showSuggestions = false;
	};

	const loadAll = async () => {
		lists = await getLists();
		categories = await getCategories();
		units = await getUnits();
		products = await getProducts();
		if (!activeListId && lists.length > 0) {
			activeListId = lists[0].id;
		}
		listTitle = lists.find((list) => list.id === activeListId)?.name ?? '';
		mergeTargetId = activeListId ?? '';
		await loadItems();
		resetForm();
	};

	const loadItems = async () => {
		if (!activeListId) {
			items = [];
			return;
		}
		items = await getItemsByList(activeListId);
	};

	const selectList = async (id: string) => {
		activeListId = id;
		listTitle = lists.find((list) => list.id === id)?.name ?? '';
		mergeTargetId = id;
		await loadItems();
	};

	const addList = async () => {
		const name = listNameInput.trim();
		if (!name) return;
		const list = await createList(name);
		listNameInput = '';
		await loadAll();
		await selectList(list.id);
	};

	const saveListName = async () => {
		if (!activeListId) return;
		const name = listTitle.trim();
		if (!name) return;
		await renameList(activeListId, name);
		await loadAll();
	};

	const removeList = async () => {
		if (!activeListId) return;
		await deleteList(activeListId);
		activeListId = null;
		await loadAll();
	};

	const handleProductInput = (value: string) => {
		productName = value;
		if (!value.trim()) {
			suggestions = [];
			showSuggestions = false;
			return;
		}
		suggestions = suggestCatalog(value, $locale);
		showSuggestions = suggestions.length > 0;

		const matched = findCatalogByName(value, $locale);
		if (matched) {
			categoryId = matched.categoryId;
			unitId = matched.unitId;
			return;
		}

		const resolved = resolveCategoryForName(value, $locale);
		if (resolved) {
			categoryId = resolved;
		}
	};

	const selectSuggestion = (product: CatalogProduct) => {
		const name = product.names[$locale] ?? product.names.en;
		productName = name;
		categoryId = product.categoryId;
		unitId = product.unitId;
		suggestions = [];
		showSuggestions = false;
	};

	const startEdit = (item: Item) => {
		formMode = 'edit';
		editingItemId = item.id;
		productName = item.name;
		quantity = item.quantity;
		unitId = item.unitId;
		categoryId = item.categoryId;
		comment = item.comment;
		scope = item.scope;
		showSuggestions = false;
	};

	const submitItem = async () => {
		if (!activeListId) return;
		const name = productName.trim();
		if (!name) return;
		let chosenCategoryId = categoryId || categories[0]?.id;
		let chosenUnitId = unitId || units[0]?.id;
		const safeQuantity = Number(quantity) || 0;

		const matchedCatalog = findCatalogByName(name, $locale);
		if (matchedCatalog) {
			chosenCategoryId = matchedCatalog.categoryId;
			chosenUnitId = matchedCatalog.unitId;
		}
		const resolvedCategory = resolveCategoryForName(name, $locale);
		if (resolvedCategory) {
			chosenCategoryId = resolvedCategory;
		}

		const existing = await findProductByName(name);
		const productId = existing
			? existing.id
			: (await createProduct(name, chosenCategoryId ?? categoryId, chosenUnitId ?? unitId))
					.id;

		if (formMode === 'edit' && editingItemId) {
			await updateItem(editingItemId, {
				productId,
				name,
				quantity: safeQuantity,
				unitId: chosenUnitId,
				categoryId: chosenCategoryId,
				comment,
				scope
			});
		} else {
			await createItem(activeListId, {
				productId,
				name,
				quantity: safeQuantity,
				unitId: chosenUnitId,
				categoryId: chosenCategoryId,
				comment,
				scope
			});
		}

		await loadAll();
	};

	const removeItem = async (id: string) => {
		await deleteItem(id);
		await loadAll();
	};

	const togglePurchased = async (id: string, purchased: boolean) => {
		await toggleItem(id, purchased);
		items = items.map((item) => (item.id === id ? { ...item, purchased } : item));
	};

	const openExport = async () => {
		if (!activeListId) return;
		const payload = await buildSharePayload(activeListId);
		if (!payload) return;
		qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
			errorCorrectionLevel: 'M',
			margin: 2,
			width: 260
		});
		exportDialog?.showModal();
	};

	const openImport = async () => {
		pendingPayload = null;
		scanError = '';
		importMode = 'new';
		importDialog?.showModal();
		await tick();
		startScan();
	};

	const startScan = async () => {
		if (!videoEl) return;
		scanner?.reset();
		scanner = new BrowserQRCodeReader();
		try {
			await scanner.decodeFromVideoDevice(null, videoEl, (result) => {
				if (!result) return;
				const parsed = parseSharePayload(result.getText());
				if (!parsed) {
				scanError = get(t).invalidQr;
					return;
				}
				pendingPayload = parsed;
				scanner?.reset();
			});
		} catch (error) {
		scanError = error instanceof Error ? error.message : get(t).cameraError;
		}
	};

	const closeImport = () => {
		scanner?.reset();
		pendingPayload = null;
		scanError = '';
		importDialog?.close();
	};

	const handleImportClose = () => {
		scanner?.reset();
	};

	const confirmImport = async () => {
		if (!pendingPayload) return;
		const listId = await applySharePayload(
			pendingPayload,
			importMode,
			importMode === 'merge' ? mergeTargetId : undefined
		);
		await loadAll();
		activeListId = listId;
		await loadItems();
		closeImport();
	};

	onMount(async () => {
		await seedDefaults();
		await loadAll();
	});

	$: categoryMap = new Map(
		categories.map((category) => [category.id, $t.categoryName?.[category.id] ?? category.name])
	);
	$: unitMap = new Map(
		units.map((unit) => [unit.id, $t.unitShort?.[unit.id] ?? unit.short])
	);
	$: productNameMap = new Map(
		products.map((product) => [product.id, $t.productName?.[product.id] ?? product.name])
	);
	$: grouped = items.reduce<Record<string, Item[]>>((acc, item) => {
		(acc[item.categoryId] ||= []).push(item);
		return acc;
	}, {});
	$: groupedEntries = Object.entries(grouped).sort((a, b) => {
		const nameA = categoryMap.get(a[0]) ?? '';
		const nameB = categoryMap.get(b[0]) ?? '';
		return nameA.localeCompare(nameB);
	});
</script>

<div class="app">
	<aside class="sidebar">
		<header>
	<h1>{$t.appName}</h1>
	<button class="secondary" on:click={openImport}>{$t.importQr}</button>
		</header>
	<p>{$t.sidebarHint}</p>

		<div class="field">
		<label for="list-name">{$t.newListLabel}</label>
		<input id="list-name" placeholder={$t.newListPlaceholder} bind:value={listNameInput} />
	</div>
	<button on:click={addList}>{$t.createList}</button>

		<div class="list">
			{#each lists as list (list.id)}
				<div class={`list-item ${list.id === activeListId ? 'active' : ''}`}>
					<div>
						<strong>{list.name}</strong>
						<div class="meta">{list.id.slice(0, 6)}</div>
					</div>
				<button class="ghost" on:click={() => selectList(list.id)}>{$t.open}</button>
			</div>
		{/each}
	</div>

	<div class="field">
		<label for="lang">{$t.language}</label>
		<select id="lang" bind:value={$locale}>
			<option value="en">English</option>
			<option value="ru">Русский</option>
		</select>
	</div>
</aside>

	<main class="main">
		<header>
			<div>
			<h2>{listTitle || $t.selectList}</h2>
			<p>{items.length} {$t.itemsCount}</p>
		</div>
		<div class="actions">
			<button class="secondary" on:click={openExport} disabled={!activeListId}>{$t.shareQr}</button>
			<button class="danger" on:click={removeList} disabled={!activeListId}>{$t.deleteList}</button>
		</div>
	</header>

		{#if activeListId}
			<div class="field">
			<label for="list-title">{$t.listNameLabel}</label>
			<input id="list-title" bind:value={listTitle} />
		</div>
		<button class="secondary" on:click={saveListName}>{$t.saveName}</button>

		<section class="category-group">
			<h3>{formMode === 'edit' ? $t.editItem : $t.addItem}</h3>
			<div class="field">
				<label>{$t.productLabel}</label>
				<input
					placeholder={$t.selectProduct}
					bind:value={productName}
					on:input={(event) =>
						handleProductInput((event.currentTarget as HTMLInputElement).value)}
				/>
			</div>

			{#if showSuggestions}
				<div class="suggestions">
					{#each suggestions as suggestion (suggestion.id)}
						<button
							type="button"
							class="suggestion"
							on:mousedown={() => selectSuggestion(suggestion)}
						>
							{suggestion.names[$locale] ?? suggestion.names.en}
						</button>
					{/each}
				</div>
			{/if}

			<div class="field">
				<label>{$t.categoryLabel}</label>
				<input value={categoryMap.get(categoryId) ?? ''} disabled />
			</div>

				<div class="field">
					<label>{$t.quantityLabel}</label>
					<input type="number" min="0" step="0.1" bind:value={quantity} />
				</div>

				<div class="field">
					<label>{$t.unitLabel}</label>
					<select bind:value={unitId}>
						{#each units as unit (unit.id)}
							<option value={unit.id}>{unitMap.get(unit.id) ?? unit.short}</option>
						{/each}
					</select>
				</div>

				<div class="field">
					<label>{$t.scopeLabel}</label>
					<input bind:value={scope} placeholder={$t.scopePlaceholder} />
				</div>

				<div class="field">
					<label>{$t.commentLabel}</label>
					<textarea bind:value={comment} placeholder={$t.commentPlaceholder}></textarea>
				</div>

				<div class="actions">
					<button on:click={submitItem}>{formMode === 'edit' ? $t.editItem : $t.addItem}</button>
					<button class="secondary" on:click={resetForm}>{$t.reset}</button>
				</div>
			</section>

			{#if groupedEntries.length === 0}
				<p>{$t.noItems}</p>
			{/if}

			{#each groupedEntries as [groupId, groupItems] (groupId)}
				<section class="category-group">
					<div class="category-header">
						<strong>{categoryMap.get(groupId) ?? $t.otherCategory}</strong>
						<span class="meta">{groupItems.length} {$t.itemsCount}</span>
					</div>
					{#each groupItems as item (item.id)}
						<div class={`item-row ${item.purchased ? 'done' : ''}`}>
								<input
									type="checkbox"
									checked={item.purchased}
									on:change={(event) =>
										togglePurchased(
											item.id,
											(event.currentTarget as HTMLInputElement).checked
										)}
								/>
							<div>
								<strong>{productNameMap.get(item.productId) ?? item.name}</strong>
								<div class="meta">
									{item.quantity} {unitMap.get(item.unitId) ?? ''}
									{#if item.scope}
										 · {item.scope}
									{/if}
								</div>
								{#if item.comment}
									<div class="meta">{item.comment}</div>
								{/if}
							</div>
							<div class="actions">
								<button class="ghost" on:click={() => startEdit(item)}>{$t.edit}</button>
								<button class="ghost" on:click={() => removeItem(item.id)}>{$t.remove}</button>
							</div>
						</div>
					{/each}
				</section>
			{/each}
		{:else}
		<p>{$t.startList}</p>
	{/if}
</main>
</div>

<dialog bind:this={exportDialog}>
	<div class="dialog-content">
	<h3>{$t.shareTitle}</h3>
	{#if qrDataUrl}
		<div class="qr"><img src={qrDataUrl} alt="QR for list" /></div>
		<p>{$t.shareHint}</p>
	{/if}
	<button class="secondary" on:click={() => exportDialog?.close()}>{$t.close}</button>
</div>
</dialog>

<dialog bind:this={importDialog} on:close={handleImportClose}>
	<div class="dialog-content">
	<h3>{$t.importTitle}</h3>
	{#if pendingPayload}
		<p>
			{$t.foundList} <strong>{pendingPayload.listName}</strong> {$t.withItems}
			{pendingPayload.items.length} {$t.itemsCount}.
		</p>
		<div class="field">
			<label>{$t.importModeLabel}</label>
			<select bind:value={importMode}>
				<option value="new">{$t.importNew}</option>
				<option value="merge">{$t.importMerge}</option>
			</select>
		</div>
		{#if importMode === 'merge'}
			<div class="field">
				<label>{$t.targetList}</label>
				<select bind:value={mergeTargetId}>
					{#each lists as list (list.id)}
						<option value={list.id}>{list.name}</option>
						{/each}
					</select>
				</div>
		{/if}
		<div class="actions">
			<button on:click={confirmImport}>{$t.import}</button>
			<button class="secondary" on:click={closeImport}>{$t.cancel}</button>
		</div>
	{:else}
		<video class="video" autoplay bind:this={videoEl}></video>
		<p class="meta">{$t.scanHint}</p>
		{#if scanError}
			<p class="meta">{scanError}</p>
		{/if}
		<div class="actions">
			<button class="secondary" on:click={closeImport}>{$t.close}</button>
		</div>
	{/if}
</div>
</dialog>
