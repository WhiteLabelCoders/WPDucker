// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';

export default class classDependencyChecker {
	constructor() {
		logger.debugFn(arguments);
	}

	public static commandsToCheck: Parameters<typeof this.getFeed>[0] = [
		{ cmd: 'unzip', args: ['-v'] },
		{ cmd: 'docker', args: ['-v'] },
		{ cmd: 'docker', args: ['compose', 'version'], name: 'docker compose' },
	];

	/**
	 * The `getFeed` function checks if the commands "docker" and "docker compose" exist and returns a
	 * feed object with a general flag indicating if all commands exist.
	 * @returns The function `getFeed()` returns an object `feed` which contains a `general` property and
	 * a `commands` property. The `general` property is a boolean value indicating whether all the
	 * commands in the `commands` property exist. The `commands` property is an object containing
	 * information about specific commands. Each command has a `check` property which is a boolean value
	 * indicating whether the command exists
	 */
	static getFeed(extraCommands?: { cmd: string; args: string[]; name?: string }[]) {
		logger.debugFn(arguments);

		const feed = {
			general: true,
			commands: {} as { [key: string]: { check: boolean; name: string } },
		};
		logger.debugVar('feed', feed);

		const totalCommandsToCheck = [...(extraCommands || []), ...(this.commandsToCheck || [])];
		logger.debugVar('totalCommandsToCheck', totalCommandsToCheck);

		totalCommandsToCheck.forEach((item) => {
			const cmdFeed = {
				check: this.commandExist(item.cmd, item.args),
				name: item?.name || item.cmd,
			};
			logger.debugVar('cmdFeed', cmdFeed);

			feed.commands[item?.cmd] = cmdFeed;
		});

		logger.debugVar('feed', feed);

		const commandsKeys = Object.keys(feed.commands) as Array<keyof typeof feed.commands>;
		logger.debugVar('commandsKeys', commandsKeys);

		for (let i = 0; i < commandsKeys.length; i++) {
			const cmdKey = commandsKeys[i];
			logger.debugVar('cmdKey', cmdKey);

			if (!feed.commands[cmdKey].check) {
				feed.general = false;
				logger.debugVar('feed.general', feed.general);

				break;
			}
		}

		return feed;
	}

	/**
	 * The `check` function checks if there are any missing dependencies in the `feed` object and throws
	 * an error if there are any.
	 * @returns If the condition `if (feed.general)` is true, then nothing is returned. Otherwise, an
	 * error is thrown with the message "Missing dependencies" followed by the names of the commands with
	 * missing dependencies joined by commas.
	 */
	static check(extraCommands?: Parameters<typeof this.getFeed>[0]) {
		logger.debugFn(arguments);

		const feed = this.getFeed(extraCommands);
		logger.debugVar('feed', feed);

		if (feed.general) {
			logger.debug('Valid depenedencies!');
			return;
		}

		const commandsKeys = Object.keys(feed.commands) as Array<keyof typeof feed.commands>;
		logger.debugVar('commandsKeys', commandsKeys);

		const missingDependencies = [] as Array<
			typeof feed.commands[keyof typeof feed.commands]['name']
		>;
		logger.debugVar('missingDependencies', missingDependencies);

		for (let i = 0; i < commandsKeys.length; i++) {
			const cmdKey = commandsKeys[i];
			logger.debugVar('cmdKey', cmdKey);

			const cmd = feed.commands[cmdKey];
			logger.debugVar('cmd', cmd);

			if (cmd.check) {
				logger.debug('Valid dependency!');
				continue;
			}

			logger.debug('Inalid dependency!');

			missingDependencies.push(cmd.name);
		}
		logger.debugVar('missingDependencies', missingDependencies);

		throw `Missing dependencies "${missingDependencies.join('", "')}"!`;
	}

	/**
	 * The function checks if a given command exists in the current shell environment.
	 * @param {string} cmd - The `cmd` parameter is a string representing the command that you want to
	 * check for existence.
	 * @returns a boolean value. It returns `true` if the specified command exists, and `false` otherwise.
	 */
	public static commandExist(cmd: string, args: string[]) {
		logger.debugFn(arguments);

		let executionResult = '';
		logger.debugVar('executionResult', executionResult);

		try {
			executionResult = new TextDecoder().decode(
				(new Deno.Command(cmd, { args })).outputSync().stdout,
			);
			logger.debugVar('executionResult', executionResult);
		} catch (error) {
			const { message } = error as Error;
			logger.debug('Error during execution', message);
			return false;
		}

		if (!executionResult) {
			logger.debug('Invalid execution result', executionResult);
			return false;
		}

		logger.debug('Valid execution result', executionResult);

		return true;
	}
}
