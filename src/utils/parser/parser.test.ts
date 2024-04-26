import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { parseCliArgs } from './parser.ts';
import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { COMMANDS_META } from '../../pre_compiled/__commands_meta.ts';
import { noError } from '../no_error/no_error.ts';

Deno.test('parseCliArgs', async function testParseCliArgs(testContext) {
	for (let i = 0; i < COMMANDS_META.length; i++) {
		const commandMeta = COMMANDS_META[i];
		const commandPhrase = [...commandMeta.phrase.split(' ')];

		await testContext.step({
			name: `parseCliArgs - test of command "${commandPhrase}"`,
			fn: async () => {
				const booleans = [
					'-h',
					'--h',
					'--help',
					'--my-boolean',
				];

				const keyValues = [
					'-h=',
					'-h=loerm ipsum sot dolor am',
					'-h=loerm i#$psum sot do$#@%_8=lor am',
					'--h=loerm ipsum sot dolor am',
					'--h=loerm i#$psum sot do$#@%_8=lor am',
					'--my-argument=my custom value',
					'--my-argument=`my custom value`',
					'--my-argument="my custom value"',
					"--my-argument='my custom value'",
				];

				const cargs = [
					'arg 1',
					'arg 2',
				];

				const args = [
					...commandPhrase,
					...booleans,
					cargs[0],
					...keyValues,
					cargs[1],
				];

				assert(
					await noError(() => {
						parseCliArgs(args);
					}),
					'parse args',
				);

				const parsedArgs = parseCliArgs(args);

				assertEquals(parsedArgs.commandPhrase, commandPhrase.join(' '), 'command');

				booleans.forEach((v) => {
					const boolean = v.replace(/^(--|-)/, '');

					assert(parsedArgs.hasBoolean([boolean]), 'single hasBoolean');
				});

				assert(
					parsedArgs.hasBoolean(booleans.map((item) => item.replace(/^(--|-)/, ''))),
					'multiple hasBoolean',
				);
				assert(
					parsedArgs.hasBoolean(
						booleans.map((item) => item.replace(/^(--|-)/, '')),
						'OR',
					),
					'multiple hasBoolean OR',
				);
				assert(
					parsedArgs.hasBoolean(
						booleans.map((item) => item.replace(/^(--|-)/, '')),
						'AND',
					),
					'multiple hasBoolean AND',
				);

				keyValues.forEach((v) => {
					const kv = [
						v.slice(0, v.indexOf('=')).replace(/^(--|-)/, ''),
						v.slice(v.indexOf('=') + 1),
					] as [string, string];

					assert(parsedArgs.getKV([kv[0]])[0][0] === kv[0], 'single getKV');
				});

				assert(Array.isArray(parsedArgs.getKV()), 'getKV');

				assertEquals(parsedArgs.args, cargs, 'check args');
			},
		});
	}
});
