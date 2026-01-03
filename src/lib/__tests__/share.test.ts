import { describe, expect, it } from 'vitest';
import { parseSharePayload } from '../share';

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
	it('accepts a valid payload', () => {
		const parsed = parseSharePayload(JSON.stringify(sample));
		expect(parsed).not.toBeNull();
		expect(parsed?.listName).toBe('Weekly basket');
	});

	it('rejects invalid payloads', () => {
		const parsed = parseSharePayload('{"version":2}');
		expect(parsed).toBeNull();
	});
});
