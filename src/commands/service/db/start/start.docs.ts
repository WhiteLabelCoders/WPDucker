// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { DOCUMENTATION_COLOR_THEME } from '../../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../../utils/generate_documentation/generate_documentation.ts';

const feedArguments: string[][] = [];

const feedOptions = [
    [['-h', '--help'], 'Display documentation'],
    [['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Start the database service';
export const classCommandDbServiceStartDocs = generateDocumentation({
    usage: 'wpd service db start [OPTIONS]',
    description,
    commands: [],
    arguments: feedArguments,
    options: feedOptions,
    colorTheme: DOCUMENTATION_COLOR_THEME,
});
