# Plan: Svelte PWA Shopping List

## Assumptions (confirmed)

- MVP is offline-first with no auth or sync; all data stored in IndexedDB.
- Lists can be shared via QR; receiver can import and edit locally.
- QR uses plain JSON export; max list size ~50 items.
- Import flow: user chooses merge into existing list or create new.
- MVP screens: lists overview, list detail, item editor.
- Checklist behavior with visual strike-through for purchased items.

## Goals

- Simple, fast UI for managing multiple shopping lists.
- Items support: quantity, unit, category, comment, scope (dish/group).
- Items grouped by category with clear separation.
- PWA installable and offline-capable.

## Phase 1: Discovery & UX

- Define core entities: List, Category, Item, Scope, Unit, Product.
- Draft minimal screen flow: lists overview → list detail → item add/edit.
- Sketch data model and basic interactions (checklist, grouping by category).
- Define product catalog behavior: product → default category + unit.
- Define QR share flow: export list → QR payload → import on receiver.
- Define import options: merge vs new list.

## Phase 2: Project Setup

- Initialize SvelteKit app.
- Add PWA config (manifest, service worker, icons).
- Set up linting and tests (ESLint, Prettier, Vitest/Playwright).

## Phase 3: Data Model & Storage

- Implement local persistence layer (IndexedDB via idb or localStorage).
- Define schema and migrations for lists, categories, units, products, items, scopes.
- Enforce automatic category assignment based on selected product.

## Phase 4: Core UI

- Lists overview (create/rename/delete lists).
- List view with category grouping, item count, and checklist toggle.
- Item editor with fields: name, qty, unit, category (auto), comment, scope.
- Product picker (with defaults for category + unit).

## Phase 5: PWA & Share

- Cache strategy for shell and assets.
- Ensure offline CRUD works.
- Implement QR export/import of a list.
- Import UX with choice: merge into existing list or create new.

## Phase 6: QA & Polish

- Validate UX flows, add tests.
- Accessibility and mobile layout pass.
