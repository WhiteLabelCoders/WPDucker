import { pathExist } from '../path_exist/path_exist.ts';
import { logger } from '../../global/logger.ts';

/**
 * The function `generateUniqueBasename` generates a unique basename by appending a random ID to a
 * given prefix and checking if the resulting path already exists.
 * @param args - The `args` parameter is an object that contains the following properties:
 * @returns The function `generateUniqueBasename` returns a promise that resolves to a string value,
 * which is the generated unique basename.
 */
export async function generateUniqueBasename(args: {
	basePath: string;
	prefix?: string;
	extension?: string;
	timeout?: number;
}) {
	logger.debugFn(arguments);

	const { basePath, extension, prefix } = args;
	let candidate = '';
	logger.debugVar('candidate', candidate);

	const startDate = Date.now();
	logger.debugVar('startDate', startDate);

	const timeoutDate = args.timeout != undefined ? args.timeout : startDate + (1000 * 60 * 5);
	logger.debugVar('timeoutDate', timeoutDate);

	let number = 0;
	logger.debugVar('number', number);

	while (!candidate) {
		number++;
		logger.debugVar('number', number);

		const basename = `${prefix ? prefix : ''}${number}${extension ? `.${extension}` : ''}`;
		logger.debugVar('basename', basename);

		const path = `${basePath}/${basename}`;
		logger.debugVar('path', path);

		if (!await pathExist(path)) {
			candidate = basename;
			logger.debugVar('candidate', candidate);
		}

		if (Date.now() > timeoutDate) {
			throw `Generate unique basename hit a timeout (5 mins)!`;
		}
	}

	return candidate;
}
