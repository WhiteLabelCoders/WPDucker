// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classCliVersionManager } from './classes/cli_version_manager/cli_version_manager.ts';
import { classCommandInvoker } from './classes/command_invoker/command_invoker.ts';
import { classCommandsRepository } from './classes/command_repository/command_repository.ts';
import { classDatabase } from './classes/database/database.ts';
import { classCommandInvokerFacade } from './classes/command_invoker_facade/command_invoker_facade.ts';
import { classGitHubApiClient } from './classes/github/gh_api_client.ts';
import { CLI_DIR } from './constants/CLI_DIR.ts';
import { parseCliArgs } from './utils/parser/parser.ts';
import { generateUniqueBasename } from './utils/generate_unique_basename/generate_unique_basename.ts';
import { COMMANDS_META } from './pre_compiled/__commands_meta.ts';
import { logger } from './global/logger.ts';
import { emojify } from './utils/emojify/emojify.ts';
import { DB_SCHEMA } from './constants/DB_SCHEMA.ts';
import { DB_SERVER_SOCKET_PATH } from './constants/DB_SERVER_SOCKET_PATH.ts';

try {
	const tmpDir = `${CLI_DIR.tmp}/${await generateUniqueBasename({ basePath: CLI_DIR.tmp })}`;
	const commandArguments = parseCliArgs(Deno.args);
	const database = new classDatabase({
		dbSchema: DB_SCHEMA,
		dbServerSocketPath: DB_SERVER_SOCKET_PATH,
	});
	const gitHubApiClient = new classGitHubApiClient({ database });
	const cliVersionManager = new classCliVersionManager({
		cliDir: CLI_DIR,
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

	COMMANDS_META.forEach((commandMeta) => commandInvokerFacade.addCommand(commandMeta));

	await commandInvokerFacade.init();
	await commandInvokerFacade.exec();
	await commandInvokerFacade.destroy();
} catch (error) {
	logger.error(`${emojify(':grave:')} `, error);
}
