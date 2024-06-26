import { DOCUMENTATION_COLOR_THEME } from '../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../utils/generate_documentation.ts';
import commandProjectInitMeta from '../project/init/init.ts';
import { description as commandProjectInitDescription } from '../project/init/init.docs.ts';

const feedCommands: [string, string][] = [
	[commandProjectInitMeta.phrase, commandProjectInitDescription],
];

const feedOptions: [string | string[], string][] = [
	[['-h', '--help'], 'Display documentation'],
	[['-dbg', '--debug'], 'Display debug logs'],
];
export const commandDefaultDocs = generateDocumentation({
	usage: 'wpd [COMMANDS] [OPTIONS]',
	description: '',
	commands: feedCommands,
	arguments: [],
	options: feedOptions,
	colorTheme: DOCUMENTATION_COLOR_THEME,
});
