// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classCommand } from './command.ts';
import { TCommandArgs } from './command.d.ts';
import { parseCliArgs } from '../../utils/parser/parser.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { returnsNext, stub } from 'https://deno.land/std@0.220.0/testing/mock.ts';

Deno.test('classCommand', async function testClassCommand(t) {
	class myCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}
		public exec() {}
	}

	await t.step(async function testClassCommandDocs() {
		const args = parseCliArgs(['-h']);
		const testCommandPhrase = 'My test command phrase';
		const testCommandDocs = 'My test command documentation';
		const command = new myCommand({
			commandArgs: { ...args, commandPhrase: testCommandPhrase },
			documentation: testCommandDocs,
		});

		assert(command instanceof classCommand === true, 'Command is instanceof classCommand');
		assert(command.getPhrase() === testCommandPhrase, 'Command phrase');
		assert(command.getDocs() === testCommandDocs, 'Command docs');
		assert(await noError(() => command._exec()), 'Command display docs');
	});

	await t.step(async function testClassCommandExecution() {
		const args = parseCliArgs([]);
		const testCommandPhrase = 'My test command phrase';
		const testCommandDocs = 'My test command documentation';
		const command = new myCommand({
			commandArgs: { ...args, commandPhrase: testCommandPhrase },
			documentation: testCommandDocs,
		});
		assert(await noError(() => command._exec()), 'Command just exec');
	});

	await t.step(function testClassCommandGetOrAskForArgument() {
		const argName = 'my-argument-custom';
		const argName2 = 'my-argument-custom2';
		const argVal = 'my custom value!';
		const argVal2 = 'my custom value for prompt!';
		const argVal3 = '';
		const askForArgMessage = 'Provide your custom value:';
		const args = parseCliArgs([`--${argName}=${argVal}`]);
		const testCommandPhrase = 'My test command phrase';
		const testCommandDocs = 'My test command documentation';
		const command = new myCommand({
			commandArgs: { ...args, commandPhrase: testCommandPhrase },
			documentation: testCommandDocs,
		});

		assert(
			command.getOrAskForArg({ name: argName, askMessage: askForArgMessage }) == argVal,
			'test arg value',
		);
		const promptStub = stub(
			globalThis,
			'prompt',
			returnsNext([argVal2, argVal3, argVal3, argVal3, null, argVal2]),
		);
		assert(
			command.getOrAskForArg({ name: argName2, askMessage: askForArgMessage }) == argVal2,
			'prompt asking',
		);
		assert(
			command.getOrAskForArg({ name: argName2, askMessage: askForArgMessage }) == argVal3,
			'prompt empty',
		);
		assert(
			command.getOrAskForArg({
				name: argName2,
				askMessage: askForArgMessage,
				required: true,
			}) == argVal2,
			'prompt required argument',
		);
		promptStub.restore();
	});
});
