import { DOCUMENTATION_COLOR_THEME } from '../../../constants/DOCUMENTATION_COLOR_THEME.ts';
import { generateDocumentation } from '../../../utils/generate_documentation.ts';

const feedOptions: [string | string[], string][] = [
  [['-f', '--force'], 'Force execution'],
  [['-h', '--help'], 'Display documentation'],
  [['-dbg', '--debug'], 'Display debug logs'],
];

export const description = 'Remove the project';
export const commandProjectRemoveDocs = generateDocumentation({
  usage: 'wpd project init [ARGUMENTS] [OPTIONS]',
  description,
  commands: [],
  arguments: [],
  options: feedOptions,
  colorTheme: DOCUMENTATION_COLOR_THEME,
});
