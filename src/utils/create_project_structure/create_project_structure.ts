// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { pathExist } from '../path_exist/path_exist.ts';
import { loopOnProjectStructure } from '../loop_on_project_structure/loop_on_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';

/**
 * The function creates a project structure by creating directories and files in the specified work
 * directory.
 * @param {string} workdir - The `workdir` parameter is a string that represents the directory where
 * the project structure will be created.
 */
async function createProjectStructure(workdir: string, structure = CLI_PROJECT_STRUCTURE) {
	logger.debugFn(arguments);

	if (!workdir) {
		throw `Invalid workdir "${workdir}"`;
	}

	if (!await pathExist(workdir)) {
		logger.debug('Make directory', workdir);
		await Deno.mkdir(workdir, { recursive: true });
	}

	loopOnProjectStructure(structure, function structureCreator({ path, value }) {
		logger.debugFn(arguments);

		const isFile = typeof value === 'string';
		logger.debugVar('isFile', isFile);

		if (isFile) {
			logger.debug('Write file', path, value);
			Deno.writeFileSync(path, new TextEncoder().encode(value));
		} else {
			logger.debug('Make directory', path);
			Deno.mkdirSync(path, { recursive: true });
		}
	}, workdir);
}

export default createProjectStructure;
