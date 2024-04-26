import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { downloadFile } from './download_file.ts';
import { generateUniqueBasename } from '../generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../cwd/cwd.ts';
import { getError } from '../get_error/get_error.ts';
import { pathExist } from '../path_exist/path_exist.ts';

Deno.test('downloadFile', async function testDownloadFile() {
	const testUrl =
		'https://user-images.githubusercontent.com/26837876/266847173-447a3630-af21-468f-bc98-b6201bf43f29.png';
	const basename = '266847173-447a3630-af21-468f-bc98-b6201bf43f29.png';
	const testDest = await generateUniqueBasename({
		basePath: cwd(),
		prefix: 'test_',
	});

	assertEquals(
		typeof await downloadFile({
			url: testUrl,
			destDir: testDest,
			saveToFile: true,
			returnFileContent: false,
		}) == 'object',
		true,
		'Download file',
	);

	assertEquals(
		typeof await downloadFile({
			url: testUrl,
			destDir: testDest,
			saveToFile: true,
			returnFileContent: false,
		}) == 'object',
		true,
		'Download file (replace)',
	);

	const filename = `${testDest}/${basename}`;

	assertEquals(await pathExist(filename), true, 'file saved');

	Deno.remove(filename);

	await downloadFile({
		url: testUrl,
		destDir: testDest,
		saveToFile: false,
		returnFileContent: false,
	});

	assertEquals(await pathExist(filename), false, 'file not saved');

	const details = await downloadFile({
		url: testUrl,
		destDir: testDest,
		saveToFile: false,
		returnFileContent: true,
	});

	assertEquals(details.fileContent != undefined, true, 'file content');

	const error = await getError<string>(async () => {
		await downloadFile({
			url: `${testUrl}-no-way`,
			destDir: testDest,
			saveToFile: true,
			returnFileContent: false,
		});
	});

	assertEquals(error.length > 0, true, 'invalid request');

	await Deno.remove(testDest, { recursive: true });
});
