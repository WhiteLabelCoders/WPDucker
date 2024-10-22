// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from 'https://deno.land/std@0.224.0/assert/assert.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseSqlLite } from '../database_sqllite/database_sqllite.ts';
import { classDatabaseSqlLiteSchema } from '../database_sqllite_schema/database_sqllite_schema.ts';
import { classDatabaseServer } from './database_server.ts';
import { build_sql_query } from '../../utils/build_sql_query/build_sql_query.ts';
import { readUnixMessage } from '../../utils/read_unix_message/read_unix_message.ts';

Deno.test('databaseServer', async function testDatabaseServer(t) {
    const testPath = `${cwd()}/test_databaseServer`;

    if (!await pathExist(testPath)) {
        Deno.mkdirSync(testPath, { recursive: true });
    }

    const dbSchema = new classDatabaseSqlLiteSchema({ name: 'test' });

    dbSchema.addTable('test')
        .addColumn('id', 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .addColumn('date', 'TEXT DEFAULT CURRENT_TIMESTAMP')
        .addColumn('value', 'TEXT');

    const db = new classDatabaseSqlLite({
        schema: dbSchema.json,
        path: `${testPath}`,
    });

    const socketPath = `${testPath}/socket.sock`;

    const server = new classDatabaseServer({
        unixSocket: socketPath,
        sqlLiteDatabase: db,
    });

    await t.step('ensureUnixSocketDoesNotExist', async function () {
        assert(!await pathExist(socketPath), 'Socket should not exist');
    });

    await t.step('start', async function () {
        await server.start();

        assert(await pathExist(socketPath), 'Socket should exist');
    });

    await t.step('status', async function () {
        server.listen();

        const conn = await Deno.connect({
            path: socketPath,
            transport: 'unix',
        });

        await conn.write(new TextEncoder().encode('status'));

        const received = await readUnixMessage(conn);

        conn.close();

        assert(received, 'Should receive response from server');
    });

    const testValue = 'test value';

    await t.step('sql Insert', async function () {
        server.listen();

        const conn = await Deno.connect({
            path: socketPath,
            transport: 'unix',
        });

        const sql = JSON.stringify(
            build_sql_query`INSERT INTO test (value) VALUES (${testValue});`,
        );
        await conn.write(new TextEncoder().encode(sql));

        const received = await readUnixMessage(conn);

        conn.close();

        assert(received, 'Should receive response from server');
    });

    await t.step('sql Select', async function () {
        server.listen();

        const conn = await Deno.connect({
            path: socketPath,
            transport: 'unix',
        });

        const sql = JSON.stringify(
            build_sql_query`SELECT * FROM test WHERE value = ${testValue};`,
        );

        await conn.write(new TextEncoder().encode(sql));

        const received = await readUnixMessage(conn);

        conn.close();

        assert(received, 'Should receive response from server');
        assert(
            (JSON.parse(received)?.[0] as any)?.value == testValue,
            'Should receive correct value',
        );
    });

    await t.step('stop', async function () {
        await server.stop();

        assert(!await pathExist(socketPath), 'Socket should not exist');
    });

    if (await pathExist(testPath)) {
        Deno.removeSync(testPath, { recursive: true });
    }
});
