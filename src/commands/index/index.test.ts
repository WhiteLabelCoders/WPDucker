import { parseCliArgs } from '../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { COMMANDS_META } from '../../pre_compiled/__commands_meta.ts';
import _commandIndexMeta from './index.ts';

Deno.test('commandIndex', async function testCommandIndex() {
	const commandIndexMeta = COMMANDS_META.find((item) => item.phrase === _commandIndexMeta.phrase);

	if (!commandIndexMeta) {
		throw `Can not find command by phrase "${_commandIndexMeta.phrase}"!`;
	}

	const args: string[] = [];
	const command = new commandIndexMeta.class(
		{
			commandArgs: parseCliArgs(args),
			documentation: commandIndexMeta.documentation,
		},
	);

	assert(command.getPhrase() === commandIndexMeta.phrase, 'Check command phrase');
	assert(command.getDocs() === commandIndexMeta.documentation, 'Check command documentation');
	assert(await noError(async () => await command._exec()), 'Check command execution');
});
