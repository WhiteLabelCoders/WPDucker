import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { classDocumentStorage } from './document_storage.ts';

Deno.test('classDocumentStorage', async function testClassDocumentStorage() {
	const test_dir = `${cwd()}/test_classDocumentStorage`;

	const documentStorage = new classDocumentStorage(test_dir);

	assertEquals(documentStorage['dirname'], test_dir, 'dirname');

	assertEquals(await documentStorage.init(), undefined, 'init (document not exist)');

	const documentStorage2 = new classDocumentStorage(test_dir);

	assertEquals(await documentStorage2.init(), undefined, 'init (document exist)');

	assertEquals(
		typeof documentStorage['sessionId'] == 'string' && documentStorage['sessionId'].length > 0,
		true,
		'sessionId',
	);

	assertEquals(
		typeof documentStorage2['sessionId'] == 'string' &&
			documentStorage2['sessionId'].length > 0,
		true,
		'sessionId',
	);

	assertEquals(
		documentStorage['sessionId'] != documentStorage2['sessionId'],
		true,
		'compare sessionId of different clients',
	);

	assertEquals(
		await documentStorage2.destroySession(),
		undefined,
		'destroy session (previous test)',
	);

	const itemKeyValue = [['key1', 'value1'], ['key2', 'value2'], ['item3', 'value3'], [
		'CUSTOM',
		'custom value',
	]];

	for (let i = 0; i < itemKeyValue.length; i++) {
		assertEquals(
			await documentStorage.getItem(itemKeyValue[i][0]),
			undefined,
			`get value of not existing key index '${i}' key '${itemKeyValue[i][0]}'`,
		);
	}

	for (let i = 0; i < itemKeyValue.length; i++) {
		assertEquals(
			await documentStorage.setItem(itemKeyValue[i][0], itemKeyValue[i][1]),
			undefined,
			`set item '${itemKeyValue[i][0]}': '${itemKeyValue[i][1]}'`,
		);
	}

	for (let i = 0; i < itemKeyValue.length; i++) {
		assertEquals(
			await documentStorage.getItem(itemKeyValue[i][0]),
			itemKeyValue[i][1],
			`test value of item index '${i}' key '${itemKeyValue[i][0]}' value '${
				itemKeyValue[i][1]
			}'`,
		);
	}

	for (let i = 0; i < itemKeyValue.length; i++) {
		assertEquals(
			await documentStorage.removeItem(itemKeyValue[i][0]),
			undefined,
			`remove item index '${i}' key '${itemKeyValue[i][0]}'`,
		);
	}

	for (let i = 0; i < itemKeyValue.length; i++) {
		assertEquals(
			await documentStorage.getItem(itemKeyValue[i][0]),
			undefined,
			`check removed item index '${i}' key '${itemKeyValue[i][0]}'`,
		);
	}

	assertEquals(await documentStorage.destroySession(), undefined, 'destroy session');

	assertEquals(
		documentStorage['sessionId'] == '',
		true,
		'sessionId after destroy',
	);

	await Deno.remove(test_dir, { recursive: true });
});
