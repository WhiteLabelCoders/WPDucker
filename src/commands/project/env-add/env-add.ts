// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { logger } from '../../../global/logger.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { commandProjectEnvAddDocs } from './env-add.docs.ts';

const phrase = 'project env add';

class classCommandProjectEnvAdd extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);

		this.onlyInsideProject();

		const data = await this.getInputData();

		// Validate environment name
		this.validateEnvName(data.envName);

		const envFilePath = `${cwd()}/env/${data.envName}.env`;

		// Check if environment file already exists
		if (await pathExist(envFilePath)) {
			throw `Environment "${data.envName}" already exists!`;
		}

		// Create environment file (this is just a placeholder for actual file creation logic)
		await Deno.writeTextFile(envFilePath, '');

		logger.info(`Environment "${data.envName}" added at "${envFilePath}"`);
	}

	public getInputData() {
		return {
			envName: this.getOrAskForArg({
				name: 'env-name',
				askMessage: 'Enter environment name (only A-z 0-9 - _ are allowed):',
				required: false,
			}),
		};
	}
}

const meta: TCommandMeta = {
	phrase,
	documentation: commandProjectEnvAddDocs,
	class: classCommandProjectEnvAdd,
};

export default meta;
