// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs, TCommandMeta } from '../../classes/command/command.d.ts';
import { classCommand } from '../../classes/command/command.ts';
import { logger } from '../../global/logger.ts';
import { commandDefaultDocs, description } from './index.docs.ts';

const phrase = '';
class classCommandDefault extends classCommand {
	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		super(args);
	}
	public exec() {
		logger.debugFn(arguments);

		this.displayDocumentation();
	}
}

const meta: TCommandMeta<classCommandDefault> = {
	phrase,
	description,
	documentation: commandDefaultDocs,
	class: classCommandDefault,
};

export default meta;
