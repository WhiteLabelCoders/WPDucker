import { TCommandArgs, TCommandMeta } from '../../classes/command/command.d.ts';
import { classCommand } from '../../classes/command/command.ts';
import { logger } from '../../global/logger.ts';
import { commandDefaultDocs } from './index.docs.ts';

const phrase = '';
class classCommandDefault extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debug();

		super(args);
	}
	public exec() {
		logger.debug();

		this.displayDocumentation();
	}
}

const meta: TCommandMeta = {
	phrase,
	documentation: commandDefaultDocs,
	class: classCommandDefault,
};

export default meta;
