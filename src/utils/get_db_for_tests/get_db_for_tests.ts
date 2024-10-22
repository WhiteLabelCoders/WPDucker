// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classDatabase } from '../../classes/database/database.ts';
import { classDatabaseServer } from '../../classes/database_server/database_server.ts';
import { classDatabaseSqlLite } from '../../classes/database_sqllite/database_sqllite.ts';
import { DB_SCHEMA } from '../../constants/DB_SCHEMA.ts';
import { cwd } from '../cwd/cwd.ts';
import { pathExist } from '../path_exist/path_exist.ts';

export const getDbForTests = async () => {
	const testDir = `${cwd()}/test_db_instance`;

	if (!await pathExist(testDir)) {
		Deno.mkdirSync(testDir, { recursive: true });
	}

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

	const dbClient = new classDatabase({ dbSchema: DB_SCHEMA, dbServerSocketPath: testSocket });

	await dbServer.start();
	dbServer.listen();

	await dbClient.init();

	return { database: dbClient, server: dbServer };
};
