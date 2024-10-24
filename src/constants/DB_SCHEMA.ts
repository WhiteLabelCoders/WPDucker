// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classDatabaseSqlLiteSchema } from '../classes/database_sqllite_schema/database_sqllite_schema.ts';
import { DB_NAME } from './DB_NAME.ts';
import { _ } from '../utils/lodash/lodash.ts';

const tables = {
    sessions: {
        name: 'sessions',
        columns: [
            { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
            { name: 'created_at', type: `INTEGER DEFAULT (strftime('%s','now'))` },
        ],
    },
    session_data: {
        name: 'session_data',
        columns: [
            { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
            { name: 'session_id', type: 'INTEGER NOT NULL' },
            { name: 'created_at', type: `INTEGER DEFAULT (strftime('%s','now'))` },
            { name: 'key', type: 'TEXT' },
            { name: 'value', type: 'TEXT NULL' },
        ],
        foreignKeys: [
            { column: 'session_id', reference: { table: 'sessions', column: 'id' } },
        ],
        uniqueIndexes: [
            { columns: ['session_id', 'key'] },
        ],
    },
    persistent_data: {
        name: 'persistent_data',
        columns: [
            { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
            { name: 'created_at', type: `INTEGER DEFAULT (strftime('%s','now'))` },
            { name: 'key', type: 'TEXT' },
            { name: 'value', type: 'TEXT NULL' },
        ],
        uniqueIndexes: [
            { columns: ['key'] },
        ],
    },
};

export interface typeofTables {
    sessions: {
        id: number;
        created_at: number;
    };
    session_data: {
        id: number;
        session_id: number;
        created_at: number;
        key: string;
        value: string;
    };
    persistent_data: {
        id: number;
        created_at: number;
        key: string;
        value: string;
    };
}

const DB_SCHEMA = new classDatabaseSqlLiteSchema<typeof tables>({ name: DB_NAME, tables });

export { DB_SCHEMA };
