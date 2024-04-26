import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
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
