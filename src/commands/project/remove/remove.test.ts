// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { parseCliArgs } from '../../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { noError } from '../../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../../pre_compiled/__commands_meta.ts';
import _commandMeta from './remove.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { isUndefined } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import createProjectStructure from '../../../utils/create_project_structure/create_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../../constants/CLI_PROJECT_STRUCTURE.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';

Deno.test('commandProjectRemove', async function testCommandProjectRemove(t) {
	const _cwd = cwd();
	const testDir = `${_cwd}/${await generateUniqueBasename({
		basePath: _cwd,
		prefix: `test_command_project_remove_`,
	})}`;

	let error = undefined;
	try {
		const commandMeta = COMMANDS_META.find((item) => item.phrase === _commandMeta.phrase);

		assert(!!commandMeta == true, 'Get command meta');

		await t.step('Display help', async function testCommandRemoveHelp() {
			const args: string[] = [
				_commandMeta.phrase,
				'-h',
				'--help',
				'--debug',
			];

			const command = new commandMeta.class({
				commandArgs: parseCliArgs(args),
				documentation: commandMeta.documentation,
			});

			assert(
				await noError(async () => await command._exec()),
				'Check command help execution',
			);
		});

		await t.step('execution with force', async function testCommandRemoveWithForce() {
			await createProjectStructure(testDir, CLI_PROJECT_STRUCTURE);

			const args: string[] = [
				_commandMeta.phrase,
				'--debug',
				'--force',
			];

			const command = new commandMeta.class(
				{
					commandArgs: parseCliArgs(args),
					documentation: commandMeta.documentation,
				},
			);

			Deno.chdir(testDir);

			assert(
				await noError(async () => await command._exec()),
				'Check command execution with force',
			);
			assert(await pathExist(testDir) === false, 'Project path still exists');
		});

		await t.step('execution without force', async function testCommandRemoveWithoutForce() {
			await createProjectStructure(testDir, CLI_PROJECT_STRUCTURE);

			const args: string[] = [
				_commandMeta.phrase,
				'--debug',
			];
			const command = new commandMeta.class({
				commandArgs: parseCliArgs(args),
				documentation: commandMeta.documentation,
			});

			const userInput = testDir;
			command.askForArg.bind(command);
			command.askForArg = (_message: string, _required: boolean, defaultValue?: string) => {
				if (defaultValue) {
					return defaultValue;
				}
				return userInput;
			};

			Deno.chdir(testDir);

			assert(await noError(async () => await command._exec()), 'Check command execution');
			assert(await pathExist(testDir) === false, 'Project path still exists');
		});
	} catch (e) {
		error = e;
	}

	Deno.chdir(`${_cwd}`);

	if (await pathExist(testDir)) {
		await Deno.remove(testDir, { recursive: true });
	}

	if (!isUndefined(error)) {
		throw error;
	}
});
