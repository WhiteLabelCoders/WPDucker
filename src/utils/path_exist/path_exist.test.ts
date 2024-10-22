// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { pathExist, pathExistSync } from './path_exist.ts';

Deno.test('pathExist', async function testPathExist() {
	const shouldExist = await pathExist(Deno.cwd());
	const shouldNotExist = await pathExist(
		`${Deno.cwd()}/unrealistic-path-to-not-existed-sth.random.ext`,
	);

	const shouldExistSync = pathExistSync(Deno.cwd());
	const shouldNotExistSync = pathExistSync(
		`${Deno.cwd()}/unrealistic-path-to-not-existed-sth.random.ext`,
	);

	assertEquals(shouldExist, true, 'Path should exist');
	assertEquals(shouldNotExist, false, 'Path should not exist');
	assertEquals(shouldExistSync, true, 'Path should exist sync');
	assertEquals(shouldNotExistSync, false, 'Path should not exist sync');
});
