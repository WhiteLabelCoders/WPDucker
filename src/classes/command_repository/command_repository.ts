// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { TCommandMeta } from '../command/command.d.ts';
import { classCommand } from '../command/command.ts';

export class classCommandsRepository {
	constructor() {
		logger.debugFn(arguments);
	}
	public commands: TCommandMeta<classCommand>[] = [];

	public add<T extends classCommand>(commandMeta: TCommandMeta<T>) {
		logger.debugFn(arguments);

		if (this.has(commandMeta.phrase)) {
			return;
		}

		this.commands.push(commandMeta);
		logger.debugVar('this.commands', this.commands);
	}

	public get<T extends classCommand>(phrase: string) {
		logger.debugFn(arguments);

		const found = this.commands.find((record) => record.phrase === phrase);
		logger.debugVar('found', found);

		return found as TCommandMeta<T>;
	}

	public has<T extends classCommand>(commandPhrase: TCommandMeta<T>['phrase']) {
		logger.debugFn(arguments);

		const found = this.get(commandPhrase);
		logger.debugVar('found', found);

		const isInstanceOfCommand = found?.class?.prototype instanceof classCommand;
		logger.debugVar('isInstanceOfCommand', isInstanceOfCommand);

		return isInstanceOfCommand;
	}
}
