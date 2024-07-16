// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { getCallingFunctionName } from './calling_function_name.ts';

Deno.test('getCallingFunctionName', function testGetCallingFunctionName() {
	const thisFnName = getCallingFunctionName(2);

	assertEquals(
		thisFnName,
		'testGetCallingFunctionName',
		'get name of test function ',
	);

	assertEquals(
		getCallingFunctionName(0, true),
		'Unknown',
		'force unknown name',
	);
});
