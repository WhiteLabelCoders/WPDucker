// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from 'https://deno.land/std@0.200.0/assert/assert.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { ensureExecutePermissions } from '../../utils/ensure_execute_permissions/ensure_execute_permissions.ts';
import { pathExistSync } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseService } from './database_service.ts';

Deno.test('classDatabaseService', async function testDatabaseService(t) {
	const testDir = `${cwd()}/test_classDatabaseService`;

	if (!pathExistSync(testDir)) {
		Deno.mkdirSync(testDir, { recursive: true });
	}

	const DB_SERVICE_NAME = 'test_wpducker_db';
	const EXEC_FILE_PATH = `${testDir}/service.sh`;
	const OUTPUT_FILE = `${testDir}/output.txt`;
	const STD_ERROR_FILE = `${testDir}/std.error.txt`;
	const STD_OUTPUT_FILE = `${testDir}/std.output.txt`;

	Deno.writeTextFileSync(EXEC_FILE_PATH, `echo "Hello World!" > "${OUTPUT_FILE}"`);

	ensureExecutePermissions(EXEC_FILE_PATH);

	const dbService = new classDatabaseService({
		name: DB_SERVICE_NAME,
		description: 'WPDucker database service',
		execPath: `${EXEC_FILE_PATH}`,
		execArgs: [],
		stdErrPath: STD_ERROR_FILE,
		stdOutPath: STD_OUTPUT_FILE,
	});

	await t.step('install', async function testDatabaseServiceInstall() {
		await dbService.install(true);

		assert(await dbService.isServiceLoaded(), 'Service not found!');
	});

	await t.step('re-install', async function testDatabaseServiceInstall() {
		await dbService.install(true);

		assert(await dbService.isServiceLoaded(), 'Service not found!');
	});

	await t.step('uninstall', async function testDatabaseServiceUninstall() {
		await dbService.uninstall();

		assert(
			!await dbService.isServiceLoaded(),
			'Service found!',
		);
	});

	if (pathExistSync(testDir)) {
		Deno.removeSync(testDir, { recursive: true });
	}
});
