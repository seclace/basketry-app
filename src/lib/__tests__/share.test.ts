// Copyright 2026 Vadim Goldenko
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodeSharePayload, encodeSharePayload } from '../share';

const sample = {
	version: 1,
	listName: 'Weekly basket',
	items: [
		{
			name: 'Milk',
			quantity: 2,
			unit: 'l',
			category: 'Dairy',
			comment: '',
			scope: 'Breakfast',
			purchased: false
		}
	]
};

describe('parseSharePayload', () => {
	it('accepts a valid payload', async () => {
		const parsed = await decodeSharePayload(JSON.stringify(sample));
		expect(parsed).not.toBeNull();
		expect(parsed?.listName).toBe('Weekly basket');
	});

	it('rejects invalid payloads', async () => {
		const parsed = await decodeSharePayload('{"version":2}');
		expect(parsed).toBeNull();
	});

	it('roundtrips encoded payloads', async () => {
		const encoded = await encodeSharePayload(sample);
		const parsed = await decodeSharePayload(encoded);
		expect(parsed).not.toBeNull();
		expect(parsed?.items.length).toBe(1);
	});
});
