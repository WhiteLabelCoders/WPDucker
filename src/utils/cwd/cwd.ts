import { logger } from '../../global/logger.ts';

/**
 * The function `cwd` returns the current working directory.
 */
export function cwd() {
	logger.debugFn(arguments);

	const currentWorkingDir = Deno.cwd();
	logger.debugVar('currentWorkingDir', currentWorkingDir);

	return currentWorkingDir;
}
