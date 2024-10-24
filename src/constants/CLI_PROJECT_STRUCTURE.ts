// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { getCurrentCliVersion } from '../utils/get_current_cli_version/get_current_cli_version.ts';
import { CLI_PROJECT_STRUCTURE_EMPTY_DIR } from './CLI_PROJECT_STRUCTURE_EMPTY_DIR.ts';
import { CLI_PVFB } from './CLI_PVFB.ts';

export const CLI_PROJECT_STRUCTURE = {
	wpd: {
		environments: CLI_PROJECT_STRUCTURE_EMPTY_DIR,
	},
	'wp-data': CLI_PROJECT_STRUCTURE_EMPTY_DIR,
	'wp-src': CLI_PROJECT_STRUCTURE_EMPTY_DIR,
	[`${CLI_PVFB}`]: getCurrentCliVersion(),
};
