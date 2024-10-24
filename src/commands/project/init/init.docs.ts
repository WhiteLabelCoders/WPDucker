// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { DOCUMENTATION_COLOR_THEME } from '../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments = [
	['--project-name="..."', 'Project directory name'],
];

const feedOptions = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
	[['-ncd', '--no-change-dir'], 'Do not change the current directory to the project directory'],
];

export const description = 'Initialize the project';
export const commandProjectInitDocs = generateDocumentation({
	usage: 'wpd project init [ARGUMENTS] [OPTIONS]',
	description,
	commands: [],
	arguments: feedArguments,
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
