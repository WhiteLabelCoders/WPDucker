// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { logger } from '../../../global/logger.ts';
import { commandProjectRemoveDocs, description } from './remove.docs.ts';
import { getBasename } from '../../../utils/get_basename/get_basename.ts';

const phrase = 'project remove';

class classCommandProjectRemove extends classCommand {
	constructor(args: TCommandArgs) {
		super(args);
		logger.debugFn(arguments);
	}

	public async exec() {
		logger.debugFn(arguments);

		await this.onlyInsideProject();

		const currentPwd = await this.getPwd();
		logger.debugVar('currentPwd', currentPwd);

		const projectName = getBasename(currentPwd);
		logger.debugVar('projectName', projectName);

		const forceRemove = this.args.hasBoolean(['f', 'force'], 'OR');
		logger.debugVar('forceRemove', forceRemove);

		if (!forceRemove) {
			const confirmationMessage =
				`Are you sure you want to remove the project "${projectName}"? This action cannot be undone. Please type the project name: `;
			logger.debugVar('confirmationMessage', confirmationMessage);

			const userInput = await this.askForArg({
				message: confirmationMessage,
				required: false,
				defaultValue: projectName,
			});
			logger.debugVar('userInput', userInput);

			if (userInput !== projectName) {
				logger.info('Operation cancelled, wrong project name!');
				return;
			}
		}

		const parentDir = `${currentPwd}/../`;
		logger.debugVar('parentDir', parentDir);

		logger.info('Changing current directory to parent directory.');
		Deno.chdir(parentDir);

		logger.info(`Removing project directory "${currentPwd}".`);
		await Deno.remove(currentPwd, { recursive: true });

		logger.info(`Project "${projectName}" has been removed.`);
	}
}

const meta: TCommandMeta<classCommandProjectRemove> = {
	phrase,
	description,
	documentation: commandProjectRemoveDocs,
	class: classCommandProjectRemove,
};

export default meta;
