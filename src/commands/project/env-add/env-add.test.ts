// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { parseCliArgs } from '../../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { noError } from '../../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../../pre_compiled/__commands_meta.ts';
import _commandMeta from './env-add.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { isString, isUndefined } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { loopOnProjectStructure } from '../../../utils/loop_on_project_structure/loop_on_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../../constants/CLI_PROJECT_STRUCTURE.ts';
import { logger } from '../../../global/logger.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { getError } from '../../../utils/get_error/get_error.ts';

Deno.test('classCommandProjectEnvAdd', async function testCommandProjectEnvAdd(t) {
	const testDir = `${cwd()}/${await generateUniqueBasename({
		basePath: cwd(),
		prefix: `test_command_project_env_add_`,
	})}`;

	let error = undefined;
	try {
	} catch (e) {
		error = e;
	}
	Deno.chdir(`${testDir}/../`);
	await Deno.remove(testDir, { recursive: true });

	if (!isUndefined(error)) {
		throw error;
	}
});
