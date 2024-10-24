// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { DOCUMENTATION_COLOR_THEME } from '../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { COMMANDS_META_FEED } from '../../pre_compiled/__commands_meta_feed.ts';
import { generateDocumentation } from '../../utils/generate_documentation/generate_documentation.ts';

const feedCommands = COMMANDS_META_FEED.sort((a, b) => {
	if (a[0] < b[0]) {
		return -1;
	}
	if (a[0] > b[0]) {
		return 1;
	}
	return 0;
});

const feedOptions = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Main command';
export const commandDefaultDocs = generateDocumentation({
	usage: 'wpd [COMMANDS] [OPTIONS]',
	description: description,
	commands: feedCommands,
	arguments: [],
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
