// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from '@std/assert';
import { classDatabaseSqlLiteSchema } from './database_sqllite_schema.ts';
import { _ } from '../../utils/lodash/lodash.ts';

Deno.test('classDatabaseSqlLiteSchema', async function testClassDatabaseSqlLiteSchema(t) {
    const dbName = 'wpducker_test';

    const schema = new classDatabaseSqlLiteSchema({ name: dbName });

    assert(schema.json.dbName === dbName, 'dbName is not equal');

    const tableNames = ['t1', 't2', 't3'];
    const columns = [
        ['c1', 'INTEGER PRIMARY KEY AUTOINCREMENT'],
        ['c2', 'INTEGER'],
        ['c3', 'TEXT'],
        ['c4', 'REAL'],
        ['c5', 'BLOB'],
        ['c6', 'BOOLEAN'],
        ['c7', 'NUMERIC'],
        ['c8', 'DATE'],
        ['c9', 'TIME'],
        ['c10', 'DATETIME'],
        ['c11', 'TIMESTAMP'],
        ['c12', 'VARCHAR'],
    ];

    let prevTable = '';
    for (const tableName of tableNames) {
        await t.step(function tableColumns() {
            let table = schema.addTable(tableName);
            const _columns: ReturnType<typeof table.addColumn>[] = [];
            columns.forEach((column) => {
                table = table.addColumn(column[0], column[1]);
            });

            if (prevTable) {
                table = table.addForeignKey({
                    column: columns[1][0],
                    reference: { table: prevTable, column: columns[0][0] },
                });
            }

            console.log(`Get table -> `, schema.getTable(tableName));
            console.log(`Table -> `, _.omit(table, 'addColumn', 'addForeignKey'));

            assert(
                _.isEqual(
                    schema.getTable(tableName),
                    _.omit(table, 'addColumn', 'addForeignKey', 'addUniqueIndex'),
                ),
                'table is not equal',
            );
            assert(schema.getTable(tableName).name === tableName, 'columns length is not equal');
            assert(
                schema.getTable(tableName).columns.length === columns.length,
                'columns length is not equal',
            );

            columns.forEach((column) => {
                const table = schema.getTable(tableName);
                const _column = table.columns.find((v) =>
                    v.name === column[0] && v.type === column[1]
                );

                assert(_column, 'column is not found');
            });
        });

        prevTable = tableName;
    }
});
