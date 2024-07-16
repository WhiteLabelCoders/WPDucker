// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { emojify } from '../../utils/emojify/emojify.ts';
import { parseCliArgs } from '../../utils/parser/parser.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { version } from '../cli_version_manager/cli_version_manager.d.ts';
import { classCliVersionManager } from '../cli_version_manager/cli_version_manager.ts';
import { TCommandMeta } from '../command/command.d.ts';
import { classCommandInvoker } from '../command_invoker/command_invoker.ts';
import { classCommandsRepository } from '../command_repository/command_repository.ts';
import { classDatabase } from '../database/database.ts';

/* The `classCommandInvokerFacade` class provides methods for initializing and destroying a session, creating and
removing temporary directories, and closing opened resources. */
export class classCommandInvokerFacade {
	public database;
	public commandInvoker;
	public cliVersionManager;
	public prefferedCliVersion?: version;
	public commandArguments;
	public commandsRepository;
	public checkDependenciesBeforeExecution = true;
	public tmpDir;

	constructor(
		args: {
			tmpDir: string;
			commandArguments: ReturnType<typeof parseCliArgs>;
			database: classDatabase;
			cliVersionManager: classCliVersionManager;
			commandsRepository: classCommandsRepository;
			commandInvoker: classCommandInvoker;
		},
	) {
		logger.debugFn(arguments);

		this.tmpDir = args.tmpDir;
		logger.debugVar('this.tmpDir', this.tmpDir);

		this.commandArguments = args.commandArguments;
		logger.debugVar('this.commandArguments', this.commandArguments);

		this.database = args.database;
		logger.debugVar('this.database', this.database);

		this.cliVersionManager = args.cliVersionManager;
		logger.debugVar('this.cliVersionManager', this.cliVersionManager);

		this.commandsRepository = args.commandsRepository;
		logger.debugVar('this.commandsRepository', this.commandsRepository);

		this.commandInvoker = args.commandInvoker;
		logger.debugVar('this.commandInvoker', this.commandInvoker);
	}

	public addCommand(commandMeta: TCommandMeta) {
		logger.debugFn(arguments);

		this.commandsRepository.add(commandMeta);
	}

	/**
	 * The `init` function initializes a store and creates a temporary directory.
	 */
	async init() {
		logger.debugFn(arguments);

		await this.database.init('wpd');
		await this.mkTmpDir();
	}

	/**
	 * The `destroy` function performs cleanup tasks such as removing temporary directories, destroying a
	 * session, and closing opened resources.
	 */
	async destroy() {
		logger.debugFn(arguments);

		await this.rmTmpDir();
		await this.database.destroySession();
	}

	/**
	 * The function `mkTmpDir` creates a temporary directory for the session if it doesn't already exist.
	 * @returns nothing.
	 */
	public async mkTmpDir() {
		logger.debugFn(arguments);

		if (!this.tmpDir) {
			throw `Invalid tmp directory "${this.tmpDir}"!`;
		}

		if (!await pathExist(this.tmpDir)) {
			logger.debug('Make directory', this.tmpDir);
			await Deno.mkdir(this.tmpDir, { recursive: true });
		}

		if (await this.database.getSessionValue<string | undefined>('tmpDir') !== this.tmpDir) {
			await this.database.setSessionValue('tmpDir', this.tmpDir);
		}
	}

	/**
	 * The function `rmTmpDir` removes a temporary directory and logs the process.
	 * @returns nothing (undefined) if the `tmpDir` variable is falsy (null, undefined, false, 0, empty
	 * string, NaN). Otherwise, it is removing the session temporary directory using `Deno.remove()` and
	 * returning a promise.
	 */
	public async rmTmpDir() {
		logger.debugFn(arguments);

		await this.database.removeSessionKey('tmpDir');

		if (await pathExist(this.tmpDir)) {
			logger.debug('Remove', this.tmpDir);
			await Deno.remove(this.tmpDir, { recursive: true });
		}
	}

	public getCommandObject() {
		logger.debugFn(arguments);

		const commandMeta = this.commandsRepository.get(this.commandArguments.commandPhrase);
		logger.debugVar('commandMeta', commandMeta);

		const commandClass = commandMeta?.class;
		logger.debugVar('commandClass', commandClass);

		if (!commandClass) {
			throw `Command "${this.commandArguments.primitive.join(' ')}" not found!`;
		}

		const command = new commandClass({
			commandArgs: this.commandArguments,
			documentation: commandMeta.documentation,
		});
		logger.debugVar('command', command);

		return command;
	}

	public async exec() {
		logger.debugFn(arguments);

		try {
			await this.cliVersionManager.init();
			this.commandInvoker.setCheckDependencies(true);
			this.commandInvoker.setOutsourceTarget(this.cliVersionManager.getDispatchTarget());
			this.commandInvoker.setCheckDependencies(this.checkDependenciesBeforeExecution);

			await this.commandInvoker.exec(this.getCommandObject());
		} catch (error) {
			logger.error(`${emojify(':grave:')} `, error);
		}
	}
}
