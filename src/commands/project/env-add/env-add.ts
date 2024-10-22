// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { logger } from '../../../global/logger.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { pwd } from '../../../utils/pwd/pwd.ts';
import { commandProjectEnvAddDocs } from './env-add.docs.ts';

const phrase = 'project env add';

class classCommandProjectEnvAdd extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);

		await this.onlyInsideProject();

		const data = await this.getInputData();
		logger.debugVar('data', data);

		const envDir = `${await pwd()}/wpd/environments/${data.envName}`;
		logger.debugVar('envDir', envDir);

		logger.info('Creating environment directory...');
		await Deno.mkdir(envDir, { recursive: true });

		const envConfigFile = `${envDir}/config.json`;
		logger.debugVar('envConfigFile', envConfigFile);

		logger.info('Creating environment config file...');
		await Deno.writeTextFile(envConfigFile, JSON.stringify({}));
	}

	public async getInputData() {
		const validator = async (value: string) => {
			if (await pathExist(`${await pwd()}/wpd/environments/${value}`)) {
				return `Environment '${value}' already exist!`;
			}

			return this.validateEnvName(value);
		};

		return {
			envName: await this.getOrAskForArg({
				name: 'env-name',
				askMessage: 'Enter environment name (only A-z 0-9 - _ are allowed):',
				required: false,
				throwIfInvalid: true,
				defaultValue: await generateUniqueBasename({
					prefix: 'my-env',
					basePath: `${await pwd()}/wpd/environments`,
				}),
				validator,
			}),
		};
	}
}

const meta: TCommandMeta<classCommandProjectEnvAdd> = {
	phrase,
	documentation: commandProjectEnvAddDocs,
	class: classCommandProjectEnvAdd,
};

export default meta;
