// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { pwd } from './pwd.ts';
import { logger } from '../../global/logger.ts';
import createProjectStructure from '../create_project_structure/create_project_structure.ts';
import { pathExist } from '../path_exist/path_exist.ts';
import { cwd } from '../cwd/cwd.ts';

Deno.test('pwd', async function testPwd() {
	const getRandomDig = () => Math.floor(Math.random() * (9 - 1)) + 1;
	const getTestDirPath = async () => {
		let path =
			`${cwd()}/test_pwd_${getRandomDig()}${getRandomDig()}${getRandomDig()}${getRandomDig()}`;

		while (await pathExist(path)) {
			path =
				`${cwd()}/test_pwd_${getRandomDig()}${getRandomDig()}${getRandomDig()}${getRandomDig()}`;
		}

		return path;
	};

	const testingDirPath = await getTestDirPath();
	const parentDirPath = cwd();

	logger.debug(`Var testingDirPath: '${testingDirPath}'`);

	logger.debug(`Creating environment for test`);

	logger.debug(`Creating '${testingDirPath}'`);

	await createProjectStructure(testingDirPath);

	logger.debug(`Change directory to '${testingDirPath}'`);

	Deno.chdir(testingDirPath);

	logger.debug(`Testing pwd in project'`);

	assertEquals(await pwd(), testingDirPath, 'Pwd in project');

	logger.debug(`Change directory to '${parentDirPath}'`);

	Deno.chdir(parentDirPath);

	logger.debug(`Testing pwd out of project'`);

	assertEquals(await pwd(), false, 'Pwd out of project');

	logger.debug(`Removing '${testingDirPath}'`);

	Deno.removeSync(testingDirPath, { recursive: true });
});
