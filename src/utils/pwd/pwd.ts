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
 * The function `pwd` returns the top level directory of the Wpd project.
 * @returns The `pwd` function is returning the result of the `findTopLevelOfWpdProject` function
 * called with the current working directory (`cwd()`) as its argument.
 */
export const pwd = async () => {
	return await findTopLevelOfWpdProject(cwd());
};
