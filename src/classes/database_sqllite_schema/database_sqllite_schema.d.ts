export type sqlLiteSchema = {
    dbName: string;
    tables: sqlLiteSchemaTable[];
};

export type sqlLiteSchemaColumn = {
    name: string;
    type: string;
};

export type sqlLiteSchemaForeignKey = {
    column: string;
    reference: {
        table: string;
        column: string;
    };
};

export type sqlLiteSchemaUniqueIndexes = {
    columns: string[];
};

export type sqlLiteSchemaTable = {
    name: string;
    columns: sqlLiteSchemaColumn[];
    foreignKeys?: sqlLiteSchemaForeignKey[];
    uniqueIndexes?: sqlLiteSchemaUniqueIndexes[];
};
