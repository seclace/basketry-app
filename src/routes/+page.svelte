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
	let listTitle = '';
	let sidebarOpen = false;

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
	let itemDialog: HTMLDialogElement | null = null;
let confirmDialog: HTMLDialogElement | null = null;
	let productInputEl: HTMLInputElement | null = null;
	let qrDataUrl = '';
	let scanError = '';
	let pendingPayload: SharePayload | null = null;
	let importMode: 'new' | 'merge' = 'new';
	let mergeTargetId = '';
	let videoEl: HTMLVideoElement | null = null;
	let scanner: BrowserQRCodeReader | null = null;
	let addAnother = true;

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
		addAnother = true;
	};

	const loadAll = async () => {
		lists = (await getLists()).sort(
			(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
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

	const formatListDate = () => {
		const localeTag = $locale === 'ru' ? 'ru-RU' : 'en-US';
		return new Date().toLocaleDateString(localeTag, {
			day: '2-digit',
			month: 'short'
		});
	};

	const buildDefaultListName = () => {
		const date = formatListDate();
		return $locale === 'ru' ? `Покупки ${date}` : `Weekly ${date}`;
	};

	const selectList = async (id: string) => {
		activeListId = id;
		listTitle = lists.find((list) => list.id === id)?.name ?? '';
		mergeTargetId = id;
		await loadItems();
		if (window.matchMedia('(max-width: 900px)').matches) {
			sidebarOpen = false;
		}
	};

	const addList = async () => {
		const list = await createList(buildDefaultListName());
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

	const handleListTitleInput = (event: Event) => {
		const target = event.currentTarget as HTMLElement | null;
		if (!target) return;
		listTitle = target.innerText;
	};

	const handleListTitleKey = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		(event.currentTarget as HTMLElement | null)?.blur();
	};

	const removeList = async () => {
		if (!activeListId) return;
		confirmDialog?.showModal();
	};

	const confirmRemoveList = async () => {
		if (!activeListId) return;
		await deleteList(activeListId);
		activeListId = null;
		confirmDialog?.close();
		await loadAll();
	};

	const cancelRemoveList = () => {
		confirmDialog?.close();
	};

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
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
		} else if (otherCategoryId) {
			categoryId = otherCategoryId;
		}
	};

	const selectSuggestion = async (product: CatalogProduct) => {
		const name = product.names[$locale] ?? product.names.en;
		productName = name;
		categoryId = product.categoryId;
		unitId = product.unitId;
		suggestions = [];
		showSuggestions = false;
		await tick();
		productInputEl?.focus();
	};

	const startEdit = async (item: Item) => {
		formMode = 'edit';
		editingItemId = item.id;
		productName = item.name;
		quantity = item.quantity;
		unitId = item.unitId;
		categoryId = item.categoryId;
		comment = item.comment;
		scope = item.scope;
		showSuggestions = false;
		addAnother = true;
		itemDialog?.showModal();
		await tick();
		productInputEl?.focus();
	};

	const openAddItem = async () => {
		resetForm();
		itemDialog?.showModal();
		await tick();
		productInputEl?.focus();
	};

	const submitItem = async () => {
		if (!activeListId) return;
		const keepAdding = formMode === 'add' && addAnother;
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
		} else if (otherCategoryId) {
			chosenCategoryId = otherCategoryId;
		}

		const existing = await findProductByName(name);
		const productId = existing
			? existing.id
			: (await createProduct(
					name,
					chosenCategoryId ?? otherCategoryId,
					chosenUnitId ?? unitId
			  )).id;

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

		if (keepAdding) {
			resetForm();
			addAnother = true;
			itemDialog?.showModal();
			await tick();
			productInputEl?.focus();
		} else {
			itemDialog?.close();
		}
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

	const stopScanner = () => {
		const current = scanner as unknown as {
			reset?: () => void;
			stopContinuousDecode?: () => void;
			stopStreams?: () => void;
		};
		current?.stopContinuousDecode?.();
		current?.stopStreams?.();
		current?.reset?.();
		scanner = null;
	};

	const startScan = async () => {
		if (!videoEl) return;
		stopScanner();
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
				stopScanner();
			});
		} catch (error) {
				scanError = error instanceof Error ? error.message : get(t).cameraError;
		}
	};

	const closeImport = () => {
		stopScanner();
		pendingPayload = null;
				scanError = '';
		importDialog?.close();
	};

	const closeItemDialog = () => {
		itemDialog?.close();
	};

	const handleItemDialogKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeItemDialog();
			return;
		}
		if (event.key === 'Enter') {
			const target = event.target as HTMLElement | null;
			if (target?.tagName === 'TEXTAREA') return;
			event.preventDefault();
			submitItem();
		}
	};

	const handleItemDialogClick = (event: MouseEvent) => {
		if (event.target === itemDialog) {
			closeItemDialog();
		}
	};

	const handleImportClose = () => {
		stopScanner();
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
$: otherCategoryId = categories.find((category) => category.id === 'cat-other')?.id ?? '';
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

<div class={`app ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
	<aside class="sidebar">
		<header>
			<button
				class="secondary icon-button icon-only sidebar-toggle"
				on:click={toggleSidebar}
				aria-label={$t.toggleSidebar}
			>
				{#if sidebarOpen}
					<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<path d="M4 7h16M4 12h16M4 17h16" />
					</svg>
				{/if}
				<span class="sr-only">{$t.toggleSidebar}</span>
			</button>
			<h1>{$t.appName}</h1>
			<button class="secondary icon-button icon-only" on:click={openImport} aria-label={$t.importQr}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M12 20l-6-6 1.4-1.4L11 16.2V4h2v12.2l3.6-3.6L18 14l-6 6z" />
				</svg>
				<span class="sr-only">{$t.importQr}</span>
			</button>
		</header>

		<div class="sidebar-list-scroll">
		<div class="list">
			{#each lists as list (list.id)}
				<div
					class={`list-item ${list.id === activeListId ? 'active' : ''}`}
					role="button"
					tabindex="0"
					on:click={() => selectList(list.id)}
					on:keydown={(event) => event.key === 'Enter' && selectList(list.id)}
				>
					<div>
						<strong>{list.name}</strong>
						<div class="meta">{list.id.slice(0, 6)}</div>
					</div>
				</div>
			{/each}
		</div>
		</div>

		<div class="field sidebar-language">
			<label for="lang">{$t.language}</label>
			<select id="lang" bind:value={$locale}>
				<option value="en">English</option>
				<option value="ru">Русский</option>
			</select>
		</div>

		<button class="icon-button icon-only full-width create-list-button" on:click={addList} aria-label={$t.createList}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M11 5h2v14h-2zM5 11h14v2H5z" />
			</svg>
			<span class="sr-only">{$t.createList}</span>
		</button>
	</aside>

	<main class="main">
		<header>
			<div class="header-row">
				<button class="secondary icon-button icon-only sidebar-toggle-main" on:click={toggleSidebar} aria-label={$t.toggleSidebar}>
					{#if sidebarOpen}
						<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M4 7h16M4 12h16M4 17h16" />
						</svg>
					{/if}
					<span class="sr-only">{$t.toggleSidebar}</span>
				</button>
			<div>
		{#if activeListId}
					<h2
						class="editable-title"
						contenteditable="true"
						spellcheck="false"
						data-placeholder={$t.listNameLabel}
						on:input={handleListTitleInput}
						on:blur={saveListName}
						on:keydown={handleListTitleKey}
					>
						{listTitle}
					</h2>
				{:else}
					<h2>{$t.selectList}</h2>
				{/if}
			</div>
			<div class="actions list-actions">
				<button
					class="secondary icon-button icon-only"
					on:click={openExport}
					disabled={!activeListId}
					aria-label={$t.shareQr}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M6 12l6-6 6 6-1.4 1.4L13 9.8V20h-2V9.8L7.4 13.4 6 12z" />
					</svg>
					<span class="sr-only">{$t.shareQr}</span>
				</button>
				<button
					class="danger icon-button icon-only"
					on:click={removeList}
					disabled={!activeListId}
					aria-label={$t.deleteList}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
					</svg>
					<span class="sr-only">{$t.deleteList}</span>
				</button>
			</div>
		</header>
		<p>{items.length} {$t.itemsCount}</p>

		<div class="items-scroll">
		{#if activeListId}
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
								<button class="ghost icon-button icon-only" on:click={() => startEdit(item)} aria-label={$t.edit}>
									<svg viewBox="0 0 24 24" aria-hidden="true">
										<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
									</svg>
									<span class="sr-only">{$t.edit}</span>
								</button>
								<button class="ghost icon-button icon-only" on:click={() => removeItem(item.id)} aria-label={$t.remove}>
									<svg viewBox="0 0 24 24" aria-hidden="true">
										<path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
									</svg>
									<span class="sr-only">{$t.remove}</span>
								</button>
							</div>
						</div>
					{/each}
				</section>
			{/each}
		{:else}
			<p>{$t.startList}</p>
		{/if}
		</div>
		<button
			class="icon-button icon-only add-item-bottom full-width"
			on:click={openAddItem}
			disabled={!activeListId}
			aria-label={$t.addItem}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M11 5h2v14h-2zM5 11h14v2H5z" />
			</svg>
			<span class="sr-only">{$t.addItem}</span>
		</button>
	</main>
</div>

<dialog bind:this={exportDialog}>
	<div class="dialog-content">
		<h3>{$t.shareTitle}</h3>
		{#if qrDataUrl}
			<div class="qr"><img src={qrDataUrl} alt="QR for list" /></div>
			<p>{$t.shareHint}</p>
		{/if}
		<button
			class="secondary icon-button icon-only dialog-close"
			on:click={() => exportDialog?.close()}
			aria-label={$t.close}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
			<span class="sr-only">{$t.close}</span>
		</button>
	</div>
</dialog>

<dialog bind:this={importDialog} on:close={handleImportClose}>
	<div class="dialog-content">
		<h3>{$t.importTitle}</h3>
		<button
			class="secondary icon-button icon-only dialog-close"
			on:click={closeImport}
			aria-label={$t.close}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
			<span class="sr-only">{$t.close}</span>
		</button>
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
			<div class="actions actions-right">
				<button class="icon-button icon-only" on:click={confirmImport} aria-label={$t.import}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 4l6 6-1.4 1.4L13 7.8V20h-2V7.8L7.4 11.4 6 10l6-6z" />
					</svg>
					<span class="sr-only">{$t.import}</span>
				</button>
			</div>
		{:else}
			<video class="video" autoplay bind:this={videoEl}></video>
			<p class="meta">{$t.scanHint}</p>
			{#if scanError}
				<p class="meta">{scanError}</p>
			{/if}
		{/if}
	</div>
</dialog>

<dialog bind:this={confirmDialog}>
	<div class="dialog-content">
		<h3>{$t.deleteList}</h3>
		<p>{$t.confirmDeleteList}</p>
		<button
			class="secondary icon-button icon-only dialog-close"
			on:click={cancelRemoveList}
			aria-label={$t.close}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
			<span class="sr-only">{$t.close}</span>
		</button>
		<div class="actions actions-right">
			<button class="icon-button icon-only" on:click={confirmRemoveList} aria-label={$t.deleteList}>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
				</svg>
				<span class="sr-only">{$t.deleteList}</span>
			</button>
		</div>
	</div>
</dialog>

<dialog bind:this={itemDialog} on:keydown={handleItemDialogKey} on:click={handleItemDialogClick}>
	<div class="dialog-content">
		<h3>{formMode === 'edit' ? $t.editItem : $t.addItem}</h3>
		<div class="field">
			<label>{$t.productLabel}</label>
			<input
				placeholder={$t.selectProduct}
				bind:this={productInputEl}
				bind:value={productName}
				on:input={(event) => handleProductInput((event.currentTarget as HTMLInputElement).value)}
			/>
		</div>

		{#if showSuggestions}
			<div class="suggestions">
				{#each suggestions as suggestion (suggestion.id)}
					<button
						type="button"
						class="suggestion"
						tabindex="-1"
						on:mousedown|preventDefault
						on:click={() => selectSuggestion(suggestion)}
					>
						{suggestion.names[$locale] ?? suggestion.names.en}
					</button>
				{/each}
			</div>
		{/if}

		<div class="field">
			<label>{$t.categoryLabel}</label>
			<select bind:value={categoryId}>
				{#each categories
					.filter((category) => category.id !== 'cat-other')
					.concat(categories.filter((category) => category.id === 'cat-other')) as category (category.id)}
					<option value={category.id}>
						{categoryMap.get(category.id) ?? category.name}
					</option>
				{/each}
			</select>
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

		{#if formMode === 'add'}
			<div class="inline-row">
				<label class="inline-checkbox">
					<input type="checkbox" bind:checked={addAnother} />
					{$t.addAnother}
				</label>
				<button class="icon-button icon-only" on:click={submitItem} aria-label={$t.addItem}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M5 13l4 4 10-10" />
					</svg>
					<span class="sr-only">{$t.addItem}</span>
				</button>
			</div>
		{:else}
			<div class="actions">
				<button class="icon-button icon-only" on:click={submitItem} aria-label={$t.editItem}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M5 13l4 4 10-10" />
					</svg>
					<span class="sr-only">{$t.editItem}</span>
				</button>
			</div>
		{/if}

		<button
			class="secondary icon-button icon-only dialog-close"
			on:click={closeItemDialog}
			aria-label={$t.close}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
			<span class="sr-only">{$t.close}</span>
		</button>
	</div>
</dialog>
