// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { getError } from '../../utils/get_error/get_error.ts';
import { assert } from '@std/assert';
import { cwd } from '../../utils/cwd/cwd.ts';
import { classDatabase } from './database.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseSqlLite } from '../database_sqllite/database_sqllite.ts';
import { DB_SCHEMA } from '../../constants/DB_SCHEMA.ts';
import { classDatabaseServer } from '../database_server/database_server.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { getRandomId } from '../../utils/get_random_id/get_random_id.ts';

Deno.test('classDatabase', async function testClassDatabase(t) {
	const testDir = `${cwd()}/test_classStore`;
	const testSocket = `${testDir}/socket.sock`;

	if (!await pathExist(testDir)) {
		Deno.mkdirSync(testDir, { recursive: true });
	}

	const db = new classDatabaseSqlLite({
		schema: DB_SCHEMA.json,
		path: `${testDir}`,
	});

	const dbServer = new classDatabaseServer({
		unixSocket: testSocket,
		sqlLiteDatabase: db,
	});

	await dbServer.start();
	dbServer.listen();

	const totalStores = 10;
	const stores = new Array(totalStores).fill(0).map(() =>
		new classDatabase({ dbSchema: DB_SCHEMA, dbServerSocketPath: testSocket })
	);

	await t.step('init', async function () {
		const inits = [];

		for (const store of stores) {
			inits.push(store.init());
		}

		await Promise.all(inits);
	});

	await t.step('operations', async function () {
		const operations = [];

		for (const store of stores) {
			const test = async () => {
				const sessionCreatedAt = await store.getSessionCreatedAt();

				assert(_.isNumber(sessionCreatedAt), 'session created at');

				const persistentTestKey = `sample-test-key-${getRandomId(8)}`;
				const persistentTestValue = 123;
				const testKey = `test-key-${getRandomId(8)}`;
				const testValue = `test-value-${getRandomId(8)}`;
				const sessionTestKey = `sample-test-key-${getRandomId(12)}`;
				const sessionTestValue = 321;

				assert(
					await noError(
						async () => {
							await store.setPersistentValue(persistentTestKey, persistentTestValue);
						},
					),
					'set persistent value',
				);

				assert(
					(await store.getPersistentValue(persistentTestKey))?.value ===
						persistentTestValue,
					'check persistent value',
				);

				assert(
					await noError(
						async () => {
							await store.setSessionValue(sessionTestKey, sessionTestValue);
						},
					),
					'set session value',
				);

				assert(
					(await store.getSessionValue(sessionTestKey))?.value === sessionTestValue,
					'add session value',
				);

				await store.removePersistentKey(persistentTestKey);

				assert(
					(await store.getPersistentValue(persistentTestKey))?.value === undefined,
					'remove persistent value',
				);

				await store.removeSessionKey(sessionTestKey);

				assert(
					(await store.getSessionValue(sessionTestKey))?.value === undefined,
					'remove session value',
				);

				assert(
					await noError(async () => {
						await store.setSessionValue(testKey, testValue);
					}),
					'try to set session value',
				);

				const sessionValues = await store.getAllSessionValues();
				const sessionUpdatedTestValue = `updated-${getRandomId(8)}`;

				assert(
					await noError(async () => {
						await store.setSessionValue(testKey, sessionUpdatedTestValue);
					}),
					'update session value',
				);

				const sessionValuesAfterUpdate = await store.getAllSessionValues();

				assert(
					sessionValues.length === sessionValuesAfterUpdate.length,
					'check session values length',
				);

				assert(
					(await store.getSessionValue(testKey))?.value === sessionUpdatedTestValue,
					'check updated session value',
				);

				assert(store.sessionId, 'session id');

				assert(
					await noError(
						async () => {
							await store.destroySession();
						},
					),
					'try to destroy session',
				);

				assert(!store.sessionId, 'session id');

				assert(
					(await getError<string>(async () => await store.getAllSessionValues())).length >
						0,
					'try to get session value from destroyed session',
				);

				assert(
					await noError(
						async () => {
							await store.clearPersistentData();
						},
					),
					'try to clear persistent data without initialized session',
				);

				assert(
					await noError(async () => {
						await store.getPersistentValue(persistentTestKey);
					}),
					'try to get persistent data without initialized session',
				);

				assert(
					await noError(async () => {
						await store.destroySession();
					}),
					'try to destroy session from destroyed session',
				);

				assert(
					await noError(async () => {
						await store.removePersistentKey(testKey);
					}),
					'try to remove persistent key from destroyed session',
				);

				assert(
					(await getError<string>(async () => await store.removeSessionKey(testKey)))
						?.length > 0,
					'try to remove session key from destroyed session',
				);

				assert(
					await noError(async () => {
						await store.setPersistentValue(testKey, testValue);
					}),
					'try to set persistent value to destroyed session',
				);

				const persistentValues = await store.getAllPersistentValues();
				const updatedTestValue = `updated-${getRandomId(8)}`;

				assert(
					await noError(async () => {
						await store.setPersistentValue(testKey, updatedTestValue);
					}),
					'update persistent value',
				);

				const persistentValuesAfterUpdate = await store.getAllPersistentValues();

				assert(
					persistentValues.length === persistentValuesAfterUpdate.length,
					'check persistent values length',
				);

				assert(
					(await store.getPersistentValue(testKey))?.value === updatedTestValue,
					'check updated persistent value',
				);

				assert(
					(await getError<string>(async () =>
						await store.setSessionValue(testKey, testValue)
					))
						?.length > 0,
					'try to set session value to destroyed session',
				);

				assert(
					await noError(
						async () => {
							await store.init();
						},
					),
					'try to init session',
				);
			};

			operations.push(test());
		}

		await Promise.all(operations);
	});

	await t.step('destroy', async function () {
		const destroys = [];

		for (const store of stores) {
			destroys.push(store.destroySession());
		}

		await Promise.all(destroys);
	});

	await dbServer.stop();

	if (await pathExist(testDir)) {
		Deno.removeSync(testDir, { recursive: true });
	}
});
