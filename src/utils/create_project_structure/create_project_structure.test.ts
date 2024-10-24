// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import createProjectStructure from './create_project_structure.ts';
import { getError } from '../get_error/get_error.ts';
import { assert, assertEquals } from '@std/assert';
import { noError } from '../no_error/no_error.ts';
import { pathExist } from '../path_exist/path_exist.ts';
import { cwd } from '../cwd/cwd.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { CLI_PROJECT_STRUCTURE_EMPTY_DIR } from '../../constants/CLI_PROJECT_STRUCTURE_EMPTY_DIR.ts';

Deno.test('createProjectStructure', async function testCreateProjectStructure() {
	const testStructure = Object.assign(CLI_PROJECT_STRUCTURE, {
		testDir: { emptyTestDir: CLI_PROJECT_STRUCTURE_EMPTY_DIR, testFile: 'test content' },
	});

	assert(
		(await getError<string>(async () => {
			await createProjectStructure('', testStructure);
		})).length > 0,
		'invalid workdir',
	);

	const testDir = `${cwd()}/test_createProjectStructure`;

	assert(
		await noError(async () => {
			await createProjectStructure(testDir, testStructure);
		}),
		'create custom structure',
	);

	assert(await pathExist(`${testDir}/testDir`), 'check selected path 1/3');
	assert(await pathExist(`${testDir}/testDir/emptyTestDir`), 'check selected path 2/3');
	assert(await pathExist(`${testDir}/testDir/testFile`), 'check selected path 3/3');
	assertEquals(
		Deno.readTextFileSync(`${testDir}/testDir/testFile`),
		testStructure.testDir.testFile,
		'check file content',
	);

	Deno.removeSync(testDir, { recursive: true });
});
