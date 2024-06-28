import { TCommandArgs, TCommandMeta } from '../../../classes/command/command.d.ts';
import { classCommand } from '../../../classes/command/command.ts';
import { logger } from '../../../global/logger.ts';
import { commandProjectRemoveDocs } from './remove.docs.ts';
import { getDirName, pwd } from '../../../utils/pwd/pwd.ts';
import { cwd } from '../../../utils/cwd/cwd.ts';

const phrase = 'project remove';

class classCommandProjectRemove extends classCommand {
  constructor(args: TCommandArgs) {
    super(args);
    logger.debugFn(arguments);
  }

  public async exec() {
    logger.debugFn(arguments);

    const currentPwd = await pwd();

    if (!currentPwd) {
      logger.info('Operation cancelled. Not a WPD directory!');
      return;
    }

    const projectName = getDirName(currentPwd);

    const forceRemove = this.args.boolean.includes('f') || this.args.boolean.includes('force');

    let userInput = '';

    if (!forceRemove) {
      const confirmationMessage =
        `Are you sure you want to remove the project "${projectName}"? This action cannot be undone. Please type the project name: `;
      userInput = await this.askForArg(confirmationMessage, false, projectName);

      if (userInput !== projectName) {
        logger.info('Operation cancelled, wrong project name!');
        return;
      }
    }

    Deno.chdir(`${cwd()}/../`);

    await Deno.remove(projectName, { recursive: true });

    logger.info(`Project "${projectName}" has been removed.`);
  }
}

const meta: TCommandMeta = {
  phrase,
  documentation: commandProjectRemoveDocs,
  class: classCommandProjectRemove,
};

export default meta;
