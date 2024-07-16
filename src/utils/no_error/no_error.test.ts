// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { noError } from './no_error.ts';

Deno.test('noError', async function testNoError() {
	const throwMsg = 'Sample throw message';
	const callbackWithThrow = () => {
		throw throwMsg;
	};
	const callbackWithoutThrow = () => {};

	assertEquals(await noError(callbackWithThrow), false, 'throw message');
	assertEquals(await noError(callbackWithoutThrow), true, 'no throw');
});
