import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { classDatabase } from './database.ts';

Deno.test('classDatabase', async function testClassDatabase() {
	const testDir = `${cwd()}/test_classStore`;

	const store1 = new classDatabase({ dirname: testDir });
	const store2 = new classDatabase({ dirname: testDir });

	await store1.init('customStore1');
	await store2.init('customStore2');

	const testStore = async (store: classDatabase, name: string) => {
		const persistentCreatedAt = await store.getPersistentValue<number>('_createdAt');
		const sessionCreatedAt = await store.getSessionValue<number>('_createdAt');

		assertEquals(persistentCreatedAt > 0, true, 'persistent created at');
		assertEquals(sessionCreatedAt > 0, true, 'session created at');

		const persistentTestKey = 'sample-test-key';
		const persistentTestValue = 123;

		await store.setPersistentValue(persistentTestKey, persistentTestValue);

		assertEquals(
			await store.getPersistentValue(persistentTestKey) === persistentTestValue,
			true,
			'add persistent value',
		);

		const sessionTestKey = 'key-test-sample';
		const sessionTestValue = 321;

		await store.setSessionValue(sessionTestKey, sessionTestValue);

		assertEquals(
			await store.getSessionValue(sessionTestKey) === sessionTestValue,
			true,
			'add session value',
		);

		await store.removePersistentKey(persistentTestKey);

		assertEquals(
			await store.getPersistentValue(persistentTestKey) === undefined,
			true,
			'remove persistent value',
		);

		await store.removeSessionKey(sessionTestKey);

		assertEquals(
			await store.getSessionValue(sessionTestKey) === undefined,
			true,
			'remove session value',
		);

		assertEquals((await store.getSessionValue<string>('_id')).length > 0, true, 'session id');

		await store.destroySession();

		assert(
			(await getError<string>(async () => await store.getSessionValue())).length > 0,
			'try to get session value from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.clearPersistent())).length > 0,
			'try to clear persistent data from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.getPersistentValue('_createdAt')))
				.length > 0,
			'try to get persistent data from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.deleteAll()))
				.length > 0,
			'try to delete all data from destroyed session',
		);

		const testKey = 'test-key';
		const testValue = 'test-value';

		assert(
			(await getError<string>(async () => await store.destroySession()))
				.length > 0,
			'try to destroy session from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.clearPersistent()))
				.length > 0,
			'try to clear persistent data from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.getPersistentValue()))
				.length > 0,
			'try to get persistent data from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.getSessionValue()))
				.length > 0,
			'try to get session data from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.removePersistentKey(testKey)))
				.length > 0,
			'try to remove persistent key from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.removeSessionKey(testKey)))
				.length > 0,
			'try to remove session key from destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.setPersistentValue(testKey, testValue)))
				.length > 0,
			'try to set persistent value to destroyed session',
		);

		assert(
			(await getError<string>(async () => await store.setSessionValue(testKey, testValue)))
				.length > 0,
			'try to set session value to destroyed session',
		);
	};

	await testStore(store1, 'store1');
	await testStore(store2, 'store2');

	Deno.removeSync(testDir, { recursive: true });
});
