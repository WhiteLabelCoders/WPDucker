import { parseCliArgs } from '../../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { noError } from '../../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../../pre_compiled/__commands_meta.ts';
import _commandMeta from './init.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { isString, isUndefined } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { loopOnProjectStructure } from '../../../utils/loop_on_project_structure/loop_on_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../../constants/CLI_PROJECT_STRUCTURE.ts';
import { logger } from '../../../global/logger.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { getError } from '../../../utils/get_error/get_error.ts';

Deno.test('commandProjectInit', async function testCommandProjectInit(t) {
	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_command_project_init_`,
	})}`;

	Deno.mkdirSync(testDir);

	Deno.chdir(testDir);

	let error = undefined;
	try {
		const commandMeta = COMMANDS_META.find((item) => item.phrase === _commandMeta.phrase);

		if (!commandMeta) {
			throw `Can not find command by phrase "${_commandMeta.phrase}"!`;
		}

		await t.step('Display help', async function testCommandInitHelp() {
			const args: string[] = [
				_commandMeta.phrase,
				'-h',
				'--help',
				'--debug',
			];
			const command = new commandMeta.class(
				{
					commandArgs: parseCliArgs(args),
					documentation: commandMeta.documentation,
				},
			);

			assert(
				await noError(async () => await command._exec()),
				'Check command help execution',
			);
		});

		await t.step('execution', async function testCommandInitHelp() {
			const projectName = 'my own project name';
			const args: string[] = [
				_commandMeta.phrase,
				'--debug',
				`--project-name="${projectName}"`,
			];
			const command = new commandMeta.class(
				{
					commandArgs: parseCliArgs(args),
					documentation: commandMeta.documentation,
				},
			);
			assert(await noError(async () => await command._exec()), 'Check command execution');
			Deno.chdir(`${testDir}`);
			assert(
				isString(await getError<string>(async () => await command._exec())) === true,
				'Check command execution Error',
			);
			assert(await pathExist(`${testDir}/${projectName}`) === true, 'Check project path');

			const paths: string[] = [];
			loopOnProjectStructure(CLI_PROJECT_STRUCTURE, (args) => {
				paths.push(`${testDir}/${projectName}/${args.path}`);
			});
			logger.debug(`Paths:`, paths);

			for (let i = 0; i < paths.length; i++) {
				const path = paths[i];

				assert(
					await pathExist(path) === true,
					`Validate project init dir structure - "${path}"`,
				);
			}
		});
	} catch (e) {
		error = e;
	}
	Deno.chdir(`${testDir}/../`);
	await Deno.remove(testDir, { recursive: true });

	if (!isUndefined(error)) {
		throw error;
	}
});
