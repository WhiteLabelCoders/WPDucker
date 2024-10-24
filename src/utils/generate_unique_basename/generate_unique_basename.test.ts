// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { cwd } from '../cwd/cwd.ts';
import { generateUniqueBasename } from './generate_unique_basename.ts';
import { getError } from '../get_error/get_error.ts';

Deno.test('generateUniqueBasename', async function testGenerateUniqueBasename() {
	const basename = await generateUniqueBasename({ basePath: cwd(), extension: 'txt' });

	assertEquals(!!basename, true, 'basename');

	const prefix = 'pref__3_';
	const basenameWithPrefix = await generateUniqueBasename({
		basePath: cwd(),
		extension: 'txt',
		prefix: prefix,
	});

	assertEquals(basenameWithPrefix.includes(prefix), true, 'prefix');
	assertEquals(
		(await getError<string>(async () => {
			await generateUniqueBasename({
				basePath: cwd(),
				extension: 'txt',
				prefix: prefix,
				timeout: 0,
			});
		})).length > 0,
		true,
		'test error',
	);
});
