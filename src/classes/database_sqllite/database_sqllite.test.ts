// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert, assertEquals } from '@std/assert';
import { cwd } from '../../utils/cwd/cwd.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseSqlLiteSchema } from '../database_sqllite_schema/database_sqllite_schema.ts';
import { classDatabaseSqlLite } from './database_sqllite.ts';
import { Row } from 'https://deno.land/x/sqlite@v3.9.1/mod.ts';

Deno.test('classDatabaseSqlLite', async function testClassDatabaseSqlLite(t) {
    const testPath = `${cwd()}/test_classDatabaseSqlLite`;

    if (!await pathExist(testPath)) {
        Deno.mkdirSync(testPath, { recursive: true });
    }

    const dbName = 'wpducker_test';
    const schema = new classDatabaseSqlLiteSchema({ name: dbName });

    const sqlLiteDatabase = new classDatabaseSqlLite({ schema: schema.json, path: testPath });

    const tableName = 't1';
    const tableName2 = 't2';
    const columns = [
        { name: 'c1', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
        { name: 'c2', type: 'INTEGER NOT NULL' },
        { name: 'c3', type: 'TEXT NOT NULL DEFAULT test' },
        { name: 'c4', type: 'REAL' },
        { name: 'c5', type: 'BLOB' },
        { name: 'c6', type: 'BOOLEAN' },
        { name: 'c7', type: 'NUMERIC' },
        { name: 'c8', type: 'DATE' },
        { name: 'c9', type: 'TIME' },
        { name: 'c10', type: 'DATETIME' },
        { name: 'c11', type: 'TIMESTAMP' },
        { name: 'c12', type: 'VARCHAR' },
    ];
    const foreignKeys = [{
        column: columns[1].name,
        reference: { table: tableName, column: columns[0].name },
    }];
    const uniqueIndexes = [{ columns: ['c2', 'c3'] }, { columns: ['c4', 'c5'] }];

    await t.step(async function createDatabase() {
        const databaseFilename = `${testPath}/${dbName}.db`;

        assertEquals(await pathExist(databaseFilename), true, 'Database file does not exist');
    });

    await t.step(function createTable() {
        sqlLiteDatabase.createTable({ name: tableName, columns, uniqueIndexes });
        sqlLiteDatabase.createTable({ name: tableName2, columns, foreignKeys, uniqueIndexes });

        const table = sqlLiteDatabase.provider.query(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
        );

        assertEquals(table.length, 1, 'Table does not exist');

        const table2 = sqlLiteDatabase.provider.query(`
        SELECT *
        FROM pragma_foreign_key_list('${tableName2}')
        WHERE "from" = '${foreignKeys[0].column}' AND "table" = '${
            foreignKeys[0].reference.table
        }' AND "to" = '${foreignKeys[0].reference.column}';
        `);

        assertEquals(table2.length, 1, 'Foreign key does not exist');
    });

    await t.step(function checkColumns() {
        const table = sqlLiteDatabase.provider.query(
            `PRAGMA table_info(${tableName})`,
        );

        columns.forEach((column) => {
            const [_columnIndex, columnName, columnType, notNull, defaultValue, primaryKey] =
                table.find((v: Row) => v[1] === column.name) || [];

            const hasType = column.type.includes(`${columnType}`);
            const hasNotNull = column.type.includes(`NOT NULL`);
            const hasDefault = column.type.includes(`DEFAULT`);
            const hasPrimaryKey = column.type.includes(`PRIMARY KEY`);

            assertEquals(columnName, column.name, 'Column name is not equal');
            assert(hasType, 'Column type is not equal');
            assert(notNull ? hasNotNull : !hasNotNull, 'Column not null is not equal');
            assert(defaultValue ? hasDefault : !hasDefault, 'Column default value is not equal');
            assert(primaryKey ? hasPrimaryKey : !hasPrimaryKey, 'Column primary key is not equal');
        });
    });

    sqlLiteDatabase.destroy();

    if (await pathExist(testPath)) {
        Deno.removeSync(testPath, { recursive: true });
    }
});
