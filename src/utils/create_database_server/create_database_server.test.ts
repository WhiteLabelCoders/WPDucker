// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from 'jsr:@std/assert';
import { logger } from '../../global/logger.ts';
import { cwd } from '../cwd/cwd.ts';
import { createDatabaseServer } from './create_database_server.ts';
import { classDatabaseServer } from '../../classes/database_server/database_server.ts';
import { pathExist } from '../path_exist/path_exist.ts';

Deno.test('createDatabaseServer', async () => {
    const testPath = `${cwd()}/test_createDatabaseServer`;

    if (!await pathExist(testPath)) {
        Deno.mkdirSync(testPath, { recursive: true });
    }

    const socketPath = `${testPath}/database_server.sock`;
    logger.debugVar('socketPath', socketPath);

    const dbPath = `${testPath}`;
    logger.debugVar('dbPath', dbPath);

    const dbServer = createDatabaseServer(socketPath, dbPath);

    assert(
        dbServer instanceof classDatabaseServer,
        'dbServer should be an instance of classDatabaseServer',
    );

    dbServer.sqlLiteDatabase.destroy();

    if (await pathExist(testPath)) {
        Deno.removeSync(testPath, { recursive: true });
    }
});
