import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { logger } from '../../../global/logger.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { pwd } from '../../../utils/pwd/pwd.ts';
import { commandProjectEnvAddDocs } from './env-add.docs.ts';

const phrase = 'project env add';
const ENV_NAME_REGEX = /^[A-Za-z0-9-_]+$/;

class classCommandProjectEnvAdd extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);

		const currentPwd = await pwd();

		if (!currentPwd) {
			logger.info('Operation cancelled. Not a WPD directory!');
			return;
		}

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

	public async getInputData() {
		return {
			envName: this.getOrAskForArg(
				'env-name',
				'Enter environment name (only A-z 0-9 - _ are allowed):',
				false,
			),
		};
	}

	public validateEnvName(envName: string) {
		if (!ENV_NAME_REGEX.test(envName)) {
			throw `Invalid environment name "${envName}". Only A-z 0-9 - _ are allowed.`;
		}
	}
}

const meta: TCommandMeta = {
	phrase,
	documentation: commandProjectEnvAddDocs,
	class: classCommandProjectEnvAdd,
};

export default meta;
