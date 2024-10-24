// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import {
    sqlLiteSchema,
    sqlLiteSchemaForeignKey,
    sqlLiteSchemaTable,
    type sqlLiteSchemaUniqueIndexes,
} from './database_sqllite_schema.d.ts';
import { _ } from '../../utils/lodash/lodash.ts';

/**
 * Represents a class for managing a SQL Lite database schema.
 */
export class classDatabaseSqlLiteSchema<
    Tables extends Record<
        string,
        Omit<sqlLiteSchemaTable, 'addColumn' | 'addForeignKey' | 'addUniqueIndex'>
    >,
> {
    public json: sqlLiteSchema;
    public tables: Tables;

    /**
     * Creates an instance of classDatabaseSqlLiteSchema.
     * @param args - The arguments for creating the schema.
     * @param args.name - The name of the database.
     */
    constructor(args: { name: string; tables?: Tables }) {
        logger.debugFn(arguments);

        this.json = { dbName: '', tables: [] };
        logger.debugVar('this.json', this.json);

        const { name, tables } = args;

        this.json.dbName = name;
        logger.debugVar('this.json.dbName', this.json.dbName);

        this.tables = (tables || {}) as Tables;
        logger.debugVar('this.tables', this.tables);

        if (tables) {
            this.applyTables(tables);
        }
    }

    applyTables(tables: Tables) {
        for (const table of Object.values(tables)) {
            const currentSchema = this.addTable(table.name);

            for (const column of table.columns) {
                currentSchema.addColumn(column.name, column.type);
            }

            if (_.has(table, 'foreignKeys') && _.isArray(table.foreignKeys)) {
                for (const foreignKey of table.foreignKeys) {
                    currentSchema.addForeignKey(foreignKey);
                }
            }

            if (_.has(table, 'uniqueIndexes') && _.isArray(table.uniqueIndexes)) {
                for (const uniqueIndex of table.uniqueIndexes) {
                    currentSchema.addUniqueIndex(uniqueIndex);
                }
            }
        }
    }

    /**
     * Adds a table to the schema.
     * @param name - The name of the table.
     * @returns The added table.
     */
    addTable(name: string) {
        logger.debugFn(arguments);

        const tableName = name;

        const addColumn = (name: string, type: string) => this.addColumn(tableName, name, type);

        const addForeignKey = (
            args: sqlLiteSchemaForeignKey,
        ) => this.addForeignKey(tableName, args);

        const addUniqueIndex = (
            columns: sqlLiteSchemaUniqueIndexes,
        ) => this.addUniqueIndex(tableName, columns);

        this.json.tables.push({ name, columns: [] });

        return { ...this.getTable(name), addColumn, addForeignKey, addUniqueIndex };
    }

    /**
     * Gets a table from the schema.
     * @param name - The name of the table.
     * @returns The retrieved table.
     * @throws An error if the table is not found.
     */
    getTable(name: string) {
        logger.debugFn(arguments);

        const table = this.json.tables.find((table) => table.name === name);
        logger.debugVar('table', table);

        if (!table) {
            throw new Error(`Table ${name} not found!`);
        }

        return table;
    }

    /**
     * Adds a column to a table in the schema.
     * @param tableName - The name of the table.
     * @param name - The name of the column.
     * @param type - The type of the column.
     * @returns The table with the added column.
     */
    addColumn(tableName: string, name: string, type: string) {
        logger.debugFn(arguments);

        const table = this.getTable(tableName);

        const addColumn = (name: string, type: string) => this.addColumn(tableName, name, type);

        const addForeignKey = (
            args: sqlLiteSchemaForeignKey,
        ) => this.addForeignKey(tableName, args);

        const addUniqueIndex = (
            columns: sqlLiteSchemaUniqueIndexes,
        ) => this.addUniqueIndex(tableName, columns);

        table.columns.push({ name, type });

        return { ...this.getTable(tableName), addColumn, addForeignKey, addUniqueIndex };
    }

    /**
     * Adds a foreign key to a table in the schema.
     * @param tableName - The name of the table.
     * @param args - The arguments for adding the foreign key.
     * @param args.column - The name of the column.
     * @param args.reference - The reference for the foreign key.
     * @param args.reference.table - The name of the reference table.
     * @param args.reference.column - The name of the reference column.
     * @returns The table with the added foreign key.
     */
    addForeignKey(tableName: string, args: sqlLiteSchemaForeignKey) {
        logger.debugFn(arguments);

        const { column, reference } = args;

        const table = this.getTable(tableName);

        const addColumn = (name: string, type: string) => this.addColumn(tableName, name, type);

        const addForeignKey = (
            args: sqlLiteSchemaForeignKey,
        ) => this.addForeignKey(tableName, args);

        const addUniqueIndex = (
            columns: sqlLiteSchemaUniqueIndexes,
        ) => this.addUniqueIndex(tableName, columns);

        table.foreignKeys = table.foreignKeys || [];

        table.foreignKeys.push({ column, reference });

        return { ...this.getTable(tableName), addColumn, addForeignKey, addUniqueIndex };
    }

    addUniqueIndex(tableName: string, uniqueIndex: sqlLiteSchemaUniqueIndexes) {
        logger.debugFn(arguments);

        const table = this.getTable(tableName);

        const addColumn = (name: string, type: string) => this.addColumn(tableName, name, type);

        const addForeignKey = (
            args: sqlLiteSchemaForeignKey,
        ) => this.addForeignKey(tableName, args);

        const addUniqueIndex = (
            columns: sqlLiteSchemaUniqueIndexes,
        ) => this.addUniqueIndex(tableName, columns);

        table.uniqueIndexes = table.uniqueIndexes || [];

        table.uniqueIndexes.push(uniqueIndex);

        return { ...this.getTable(tableName), addColumn, addForeignKey, addUniqueIndex };
    }
}
