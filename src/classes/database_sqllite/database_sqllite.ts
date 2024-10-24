// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { DB } from 'https://deno.land/x/sqlite@v3.9.1/mod.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { logger } from '../../global/logger.ts';
import {
    sqlLiteSchema,
    sqlLiteSchemaTable,
} from '../database_sqllite_schema/database_sqllite_schema.d.ts';
import { pathExistSync } from '../../utils/path_exist/path_exist.ts';

export class classDatabaseSqlLite {
    public schema: sqlLiteSchema;
    public path: string;
    public provider: DB;

    constructor(args: { schema: sqlLiteSchema; path?: string }) {
        logger.debugFn(arguments);

        const { schema, path = cwd() } = args;

        this.schema = schema;
        logger.debugVar('this.schema', this.schema);

        this.path = path;
        logger.debugVar('this.path', this.path);

        this.ensureDbDirExists();

        this.provider = new DB(`${this.path}/${this.schema.dbName}.db`);
        logger.debugVar('this.provider', this.provider);

        this.init();
    }

    ensureDbDirExists() {
        logger.debugFn(arguments);

        if (!pathExistSync(this.path)) {
            Deno.mkdirSync(this.path, { recursive: true });
            logger.debug('Database directory created');
        }
    }

    init() {
        logger.debugFn(arguments);

        this.schema.tables.forEach((table) => this.createTable(table));
    }

    destroy() {
        logger.debugFn(arguments);

        this.provider.close();
    }

    createTable(
        args: sqlLiteSchemaTable,
    ) {
        logger.debugFn(arguments);

        const { name, columns, foreignKeys, uniqueIndexes } = args;

        const columnsString = [
            columns.map((column) => `${column.name} ${column.type}`).join(','),
            foreignKeys?.map((arg) => {
                return `FOREIGN KEY (${arg.column}) REFERENCES ${arg.reference.table}(${arg.reference.column})`;
            }).join(', '),
        ].filter((predicate) => !!predicate).join(', ');

        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${name} (${columnsString})`;
        logger.debugVar('createTableQuery', createTableQuery);

        this.provider.query(createTableQuery);

        for (const uniqueIndex of uniqueIndexes || []) {
            const uniqueIndexQuery = `CREATE UNIQUE INDEX IF NOT EXISTS idx_${name}_${
                uniqueIndex.columns.join('_')
            } ON ${name} (${uniqueIndex.columns.join(', ')})`;
            logger.debugVar('uniqueIndexQuery', uniqueIndexQuery);

            this.provider.query(uniqueIndexQuery);
        }
    }
}
