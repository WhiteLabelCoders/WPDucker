import { _ } from '../../utils/lodash/lodash.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseClient } from './database_client.ts';
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { classDatabaseServer } from '../database_server/database_server.ts';
import { classDatabaseSqlLite } from '../database_sqllite/database_sqllite.ts';
import { classDatabaseSqlLiteSchema } from '../database_sqllite_schema/database_sqllite_schema.ts';
import { getRandomId } from '../../utils/get_random_id/get_random_id.ts';

Deno.test('DatabaseClient', async function testDatabaseClient(t) {
    const testPath = `${cwd()}/test_DatabaseClient`;
    const testSocket = `${testPath}/socket.sock`;

    if (!await pathExist(testPath)) {
        Deno.mkdirSync(testPath, { recursive: true });
    }

    await t.step('No socket', async function () {
        const dbClient = new classDatabaseClient({ unixSocket: `${testSocket}` });

        const error = await getError(async () => await dbClient.connect());

        assert(_.isString(error) && error.length, 'Error should be a string');
    });

    await t.step('Query', async function () {
        const dbSchema = new classDatabaseSqlLiteSchema({ name: 'test' });

        dbSchema.addTable('test')
            .addColumn('id', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .addColumn('date', 'TEXT DEFAULT CURRENT_TIMESTAMP')
            .addColumn('value', 'TEXT');

        const db = new classDatabaseSqlLite({
            schema: dbSchema.json,
            path: `${testPath}`,
        });

        const dbServer = new classDatabaseServer({
            unixSocket: testSocket,
            sqlLiteDatabase: db,
        });

        await dbServer.start();
        dbServer.listen();

        const dbClient = new classDatabaseClient({ unixSocket: `${testSocket}` });

        const querySelectEmpty = await dbClient.query`SELECT * FROM test;`;

        assert(
            _.isEmpty(querySelectEmpty) && _.isArray(querySelectEmpty),
            'Query should be an empty array',
        );

        const testValue = `my test value ${getRandomId(32, 'noise')}`;

        const queryInsert = await dbClient
            .query<{ LAST_INSERT_ROW_ID: number }>`INSERT INTO test (value) VALUES (${testValue});`;

        console.log(`queryInsert`, queryInsert);

        const querySelect = await dbClient.query<
            { value: string }
        >`SELECT value FROM test WHERE id = ${queryInsert[0].LAST_INSERT_ROW_ID}`;

        console.log(`querySelect`, querySelect);

        assert(querySelect[0].value === testValue, 'Query should return inserted value');

        await dbServer.stop();
    });

    await t.step('Invalid query', async function () {
        const dbSchema = new classDatabaseSqlLiteSchema({ name: 'test' });

        dbSchema.addTable('test')
            .addColumn('id', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            .addColumn('date', 'TEXT DEFAULT CURRENT_TIMESTAMP')
            .addColumn('value', 'TEXT');

        const db = new classDatabaseSqlLite({
            schema: dbSchema.json,
            path: `${testPath}`,
        });

        const dbServer = new classDatabaseServer({
            unixSocket: testSocket,
            sqlLiteDatabase: db,
        });

        await dbServer.start();
        dbServer.listen();

        const dbClient = new classDatabaseClient({ unixSocket: `${testSocket}` });

        const error = await getError(async () => await dbClient.query`INVALID COMMAND`);

        assert(_.isString(error) && error.length, 'Error should be a string');

        await dbServer.stop();
    });

    if (await pathExist(testPath)) {
        Deno.removeSync(testPath, { recursive: true });
    }
});
