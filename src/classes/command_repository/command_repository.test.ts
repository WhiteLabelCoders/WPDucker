import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { TCommandArgs } from '../command/command.d.ts';
import { classCommand } from '../command/command.ts';
import { classCommandsRepository } from './command_repository.ts';

Deno.test('classCommand', function testClassCommand() {
	class myCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}
		public exec() {}
	}

	const testCommandPhrase = 'My test command phrase';
	const commandClass = myCommand;
	const commandMeta = {
		phrase: testCommandPhrase,
		class: commandClass,
	};
	const commandRepo = new classCommandsRepository();

	assert(commandRepo.add(commandMeta) === undefined, 'Add command to repository');
	assert(
		commandRepo.add(commandMeta) === undefined,
		'Try to add duplicated command to repository',
	);
	assert(commandRepo.has(commandMeta.phrase) === true, 'Command repo has command');
	assert(commandRepo.get(testCommandPhrase) === commandMeta, 'Get command from repo');
});
