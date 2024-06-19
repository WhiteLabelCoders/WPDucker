import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { CLI_PROJECT_NAME_PREFIX } from '../../../constants/CLI_PROJECT_NAME_PREFIX.ts';
import { CLI_PROJECT_STRUCTURE } from '../../../constants/CLI_PROJECT_STRUCTURE.ts';
import { logger } from '../../../global/logger.ts';
import createProjectStructure from '../../../utils/create_project_structure/create_project_structure.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { commandProjectInitDocs } from './init.docs.ts';

const phrase = 'project init';
class classCommandProjectInit extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}

	public async exec() {
		logger.debugFn(arguments);
		const data = await this.getInputData();

		await this.validateProjectDir(data.projectName);

		const newProjectPath = `${cwd()}/${data.projectName}`;

		await createProjectStructure(newProjectPath, CLI_PROJECT_STRUCTURE);

		logger.info(`Project initialized: "${cwd()}/${data.projectName}"`);

		Deno.chdir(newProjectPath);

		logger.info(`Moved to project directory: "${newProjectPath}"`);
	}

	public async getInputData() {
		return {
			projectName: this.getOrAskForArg(
				'project-name',
				'Enter project name:',
				false,
				await generateUniqueBasename({
					basePath: cwd(),
					prefix: `${CLI_PROJECT_NAME_PREFIX}-`,
				}),
			),
		};
	}

	public async validateProjectDir(dir: string) {
		const filename = `${cwd()}/${dir}`;
		if (await pathExist(filename)) {
			throw `File "${filename}" already exist!`;
		}
	}
}

const meta: TCommandMeta = {
	phrase,
	documentation: commandProjectInitDocs,
	class: classCommandProjectInit,
};

export default meta;
