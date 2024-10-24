// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { getDbForTests } from '../../utils/get_db_for_tests/get_db_for_tests.ts';
import { getGhApiClientForTests } from '../../utils/get_gh_api_client_for_tests/get_gh_api_client_for_tests.ts';
import { parseCliArgs } from '../../utils/parser/parser.ts';
import { classCliVersionManager } from '../cli_version_manager/cli_version_manager.ts';
import { TCommandArgs } from '../command/command.d.ts';
import { classCommand } from '../command/command.ts';
import { classCommandInvoker } from '../command_invoker/command_invoker.ts';
import { classCommandsRepository } from '../command_repository/command_repository.ts';
import { classCommandInvokerFacade } from './command_invoker_facade.ts';

Deno.test('classCommandInvokerFacade', async function testClassCommandInvokerFacade() {
	const testDir = `${cwd()}/test_classCommandInvokerFacade`;
	const testData = {
		dir: {
			test: `${testDir}`,
			project: `${testDir}/project`,
			cli: {
				main: `${testDir}/.cli`,
				tmp: `${testDir}/.cli/tmp`,
				versions: `${testDir}/.cli/versions`,
				localStorage: `${testDir}/.cli/localStorage`,
			},
		},
	};

	const tmpDir = testData.dir.cli.tmp;
	const commandArguments = parseCliArgs(['./', '--debug']);
	const { database, server } = await getDbForTests();

	const gitHubApiClient = getGhApiClientForTests(database);
	const cliVersionManager = new classCliVersionManager({
		cliDir: testData.dir.cli,
		gitHubApiClient,
		tmpDir,
	});
	const commandsRepository = new classCommandsRepository();
	const commandInvoker = new classCommandInvoker();
	const commandInvokerFacade = new classCommandInvokerFacade({
		tmpDir,
		commandArguments,
		database,
		cliVersionManager,
		commandsRepository,
		commandInvoker,
	});

	class myClassCommand extends classCommand {
		constructor(args: TCommandArgs) {
			super(args);
		}

		exec(): void | Promise<void> {
			logger.debug('My command for commandInvokerFacade');
		}
	}

	commandInvokerFacade.addCommand({
		phrase: '',
		description: '',
		class: myClassCommand,
	});

	await commandInvokerFacade.init();

	const latestVer = (await cliVersionManager.getVersionsList()).at(-1)?.tagName;

	if (!latestVer) {
		throw 'Undefined latest version of cli!';
	}

	commandInvokerFacade.cliVersionManager.setPrefferdCliVersion(latestVer);

	await commandInvokerFacade.exec();
	await commandInvokerFacade.destroy();
	await database.destroySession();
	await server.stop();

	await Deno.remove(testDir, { recursive: true });
});
