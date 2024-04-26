import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { logger } from '../../global/logger.ts';

/**
 * The function `loopOnProjectStructure` iterates over a project structure object and executes a
 * callback function for each key-value pair, including nested objects.
 * @param obj - The `obj` parameter is an object that represents the project structure. It is of type
 * `typeof CLI_PROJECT_STRUCTURE`, which means it should have the same structure as the
 * `CLI_PROJECT_STRUCTURE` object.
 * @param callback - The `callback` parameter is a function that will be called for each item in the
 * `CLI_PROJECT_STRUCTURE` object. It will be passed an object with the following properties:
 * @param [initialPath=.] - The initialPath parameter is a string that represents the starting path for
 * the loop. It is set to '.' by default, which means the loop will start at the current directory.
 * However, you can provide a different path if you want the loop to start at a specific directory.
 */
export const loopOnProjectStructure = (
	obj: typeof CLI_PROJECT_STRUCTURE,
	callback: (args: {
		path: string;
		value: typeof obj[keyof typeof obj];
		key: keyof typeof CLI_PROJECT_STRUCTURE;
	}) => void,
	initialPath = '.',
) => {
	const keys = Object.keys(obj);

	logger.debug(`Directory items: "${keys.join(', ')}"`);

	keys.forEach(function iteration(v) {
		const key = v as keyof typeof CLI_PROJECT_STRUCTURE;
		const value = obj[key];
		const currentPath = `${initialPath}/${key}`;

		logger.debug(`key:`, key);
		logger.debug(`value:`, value);
		logger.debug(`currentPath:`, currentPath);

		callback({ path: currentPath, value, key });

		if (null !== value && typeof value === 'object' && Object.keys(value).length) {
			logger.debug('Jump to subdir!');
			loopOnProjectStructure(value as typeof CLI_PROJECT_STRUCTURE, callback, currentPath);
		}
	});
};
