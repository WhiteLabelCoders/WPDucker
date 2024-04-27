import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { classCommandInvoker } from './command_invoker.ts';
import { isFunction, isString } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { classCommand } from '../command/command.ts';
import { TCommandArgs } from '../command/command.d.ts';
import { parseCliArgs } from '../../utils/parser/parser.ts';
import { logger } from '../../global/logger.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { getError } from '../../utils/get_error/get_error.ts';
Deno.test('classCommandInvoker', async function testClassCommandInvoker() {
	const commandInvokerFactory = () => new classCommandInvoker();

	let invoker = commandInvokerFactory();

	invoker.setCheckDependencies(true);

	assert(invoker.checkDependencies === true, 'setCheckDependencies');

	invoker.setOutsourceTarget('myTarget');

	assert(invoker.outsourceTarget?.[0] === 'myTarget', 'setOutsourceTarget');

	assert(
		isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for not empty string',
	);

	invoker.setOutsourceTarget('');

	assert(
		isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for empty string',
	);

	invoker = commandInvokerFactory();

	assert(
		isFunction(invoker.getCommandExecutionCallback()),
		'getCommandExecutionCallback for undefined',
	);

	class myClassCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}

		exec(): void | Promise<void> {
			logger.debug('My command');
		}
	}

	let command = new myClassCommand({
		commandArgs: parseCliArgs(['./']),
	});

	const cmdPath = (new TextDecoder()).decode(
		(new Deno.Command('which', { args: ['ls'] })).outputSync().stdout,
	).trim();

	invoker.setOutsourceTarget(cmdPath);

	assert(await noError(async () => await invoker.outsourceCommand(command)), 'outsource command');

	invoker.setOutsourceTarget('');

	assert(
		isString(await getError(async () => await invoker.outsourceCommand(command))),
		'outsource command with error',
	);

	invoker = commandInvokerFactory();

	invoker.setCheckDependencies(false);

	const noErrorResultDispatchCommand = await noError(async () =>
		await invoker.dispatchCommand(command)
	);
	assert(noErrorResultDispatchCommand == true, 'dispatch command');

	invoker = commandInvokerFactory();
	invoker.setCheckDependencies(false);
	invoker.setOutsourceTarget('');

	const noErrorResultExecWithDispatch = await noError(async () => await invoker.exec(command));
	assert(noErrorResultExecWithDispatch == true, 'exec with dispatch');

	invoker.setOutsourceTarget(cmdPath);

	const noErrorResultExecWithOutsource = await noError(async () => await invoker.exec(command));
	assert(noErrorResultExecWithOutsource, 'exec with outsource');

	const errorMsg = 'Expected error throw!';
	class myClassCommandWithError extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}

		exec(): void | Promise<void> {
			logger.debug('My command with error');

			throw errorMsg;
		}
	}

	command = new myClassCommandWithError({
		commandArgs: parseCliArgs(['./']),
	});

	invoker.setOutsourceTarget('');

	assert(
		await getError(async () => await invoker.exec(command)) === errorMsg,
		'exec with dispatch Error',
	);
});
