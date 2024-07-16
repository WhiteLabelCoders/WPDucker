// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

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
