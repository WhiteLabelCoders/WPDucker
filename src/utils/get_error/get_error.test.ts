import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { getError } from './get_error.ts';

Deno.test('getError', async function testGetError() {
	const throwMsg = 'Sample throw message';
	const callbackWithThrow = () => {
		throw throwMsg;
	};
	const callbackWithoutThrow = () => {};

	assertEquals(await getError<typeof throwMsg>(callbackWithThrow), throwMsg, 'throw message');
	assertEquals(await getError<undefined>(callbackWithoutThrow), undefined, 'no throw');
});
