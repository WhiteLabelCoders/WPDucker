// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { version } from '../../classes/cli_version_manager/cli_version_manager.d.ts';
import { logger } from '../../global/logger.ts';
import { cliVersion } from '../../pre_compiled/__cli_version.ts';

/**
 * The function `getCurrentCliVersion` is an asynchronous function that retrieves the current CLI
 * version by importing a module and returning the version string.
 * @returns the current CLI version as a string.
 */
export function getCurrentCliVersion() {
	logger.debugFn(arguments);

	const version = cliVersion as version;
	logger.debugVar('version', version);

	return version;
}
