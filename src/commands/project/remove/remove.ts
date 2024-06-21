import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { CLI_PROJECT_NAME_PREFIX } from '../../../constants/CLI_PROJECT_NAME_PREFIX.ts';
import { CLI_PROJECT_STRUCTURE } from '../../../constants/CLI_PROJECT_STRUCTURE.ts';
import { logger } from '../../../global/logger.ts';
import createProjectStructure from '../../../utils/create_project_structure/create_project_structure.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';
import { generateUniqueBasename } from '../../../utils/generate_unique_basename/generate_unique_basename.ts';
import { pathExist } from '../../../utils/path_exist/path_exist.ts';
import { commandProjectRemoveDocs } from './remove.docs.ts';
import { pwd } from '../../../utils/pwd/pwd.ts';

const phrase = 'project remove';

class classCommandProjectRemove extends classCommand {
  constructor(args: TCommandArgs) {
    logger.debugFn(arguments);

    super(args);
  }

  public async exec() {
    logger.debugFn(arguments);
    const data = await this.getInputData();
  }

  public async getInputData() {
    return {
      projectName: this.getOrAskForArg(
        'force',
        'Enter project name:',
        false,
        await generateUniqueBasename({
          basePath: cwd(),
          prefix: `${CLI_PROJECT_NAME_PREFIX}-`,
        }),
      ),
    };
  }
}

const meta: TCommandMeta = {
  phrase,
  documentation: commandProjectRemoveDocs,
  class: classCommandProjectRemove,
};

export default meta;
