// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { parseCliArgs } from '../../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { noError } from '../../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../../pre_compiled/__commands_meta.ts';
import _commandMeta from './env-add.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { _ } from '../../../utils/lodash/lodash.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { getError } from '../../../utils/get_error/get_error.ts';
import { initProject } from '../../../utils/init_project/init_project.ts';
import { logger } from '../../../global/logger.ts';
import { shell } from '../../../utils/shell/shell.ts';
import { prepareCmd } from '../../../utils/prepare_command_to_execution/prepare_command_to_execution.ts';

Deno.test('commandProjectEnvAdd', async function testCommandProjectEnvAdd(t) {
	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_command_project_env_add_`,
	})}`;

	Deno.mkdirSync(testDir);

	Deno.chdir(testDir);

	await t.step(async function _initProject() {
		const projectName = 'wpd-test-project';

		logger.log(await shell('realpath', '.'));
		logger.log(await shell('ls', '-la'));

		await initProject(projectName);

		logger.log(await shell('realpath', '.'));
		logger.log(await shell('ls', '-la'));

		Deno.chdir(projectName);

		logger.log(await shell('realpath', '.'));
		logger.log(await shell('ls', '-la'));
	});

	await t.step(async function validEnvName() {
		const envName = 'my-custom-env-name';

		const command = prepareCmd(_commandMeta, ['--debug', `--env-name="${envName}"`]);

		assert(await noError(async () => await command._exec()), 'Check command execution');

		assert(
			await pathExist(
				`${cwd()}/wpd/environments/${envName}/config.json`,
			) === true,
			'Check if config file exists',
		);
	});

	await t.step(async function invalidEnvName() {
		for (const envName of ['my-custom invalid -env-name', 'my-custom-$-env-name', '$%%%']) {
			const command = prepareCmd(_commandMeta, ['--debug', `--env-name="${envName}"`]);

			assert(
				await getError(async () => await command._exec()),
				`Command should throw an error for env name: "${envName}"`,
			);
		}
	});

	await t.step(async function invalidLocation() {
		const commandMeta = COMMANDS_META.find((item) => item.phrase === _commandMeta.phrase);

		if (!commandMeta) {
			throw `Can not find command by phrase "${_commandMeta.phrase}"!`;
		}

		const envName = 'my-custom-env-name';
		const args: string[] = [
			_commandMeta.phrase,
			'--debug',
			`--env-name="${envName}"`,
		];
		const command = new commandMeta.class(
			{
				commandArgs: parseCliArgs(args),
				documentation: commandMeta.documentation,
			},
		);

		const _cwd = cwd();

		Deno.chdir(`${testDir}`);

		assert(
			_.isString(await getError<string>(async () => await command._exec())) === true,
			'Command should not be executed outside the project',
		);

		Deno.chdir(`${_cwd}`);
	});

	Deno.chdir(`${testDir}/../`);
	await Deno.remove(testDir, { recursive: true });
});
