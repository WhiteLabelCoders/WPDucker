// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { pathExist } from '../path_exist/path_exist.ts';
import { cwd } from '../cwd/cwd.ts';

const iAmInTopLevelOfWpdProject = async (path: string) => {
	const topLevelKeys = Object.keys(CLI_PROJECT_STRUCTURE);
	for (let i = 0; i < topLevelKeys.length; i++) {
		const partOfPath = topLevelKeys[i];
		const pathToCheck = `${path}/${partOfPath}`;

		if (!await pathExist(`${pathToCheck}`)) {
			return false;
		}
	}

	return true;
};

const findTopLevelOfWpdProject = async (path: string) => {
	const explodedPath = path.split('/');

	while (explodedPath.length) {
		const reconstructedPath = explodedPath.join('/');

		if (await iAmInTopLevelOfWpdProject(reconstructedPath)) {
			return path;
		}

		explodedPath.pop();
	}

	return false;
};

/**
 * The function `pwd` in TypeScript returns the top level directory of a Wpd project by using the
 * `findTopLevelOfWpdProject` function with the current working directory `cwd()`.
 * @returns The `pwd` function is being exported as a constant. It is an asynchronous function that
 * returns the top level directory of a WPD project by calling the `findTopLevelOfWpdProject` function
 * with the current working directory obtained from `cwd()`.
 */
export const pwd = async () => {
	return await findTopLevelOfWpdProject(cwd());
};
