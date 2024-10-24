// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { parseCliArgs } from '../../utils/parser/parser.ts';

export type TCommandArgs = {
	commandArgs: ReturnType<typeof parseCliArgs>;
	documentation?: string;
};

export type TCommandMeta<T> = {
	phrase: string;
	description: string;
	documentation?: string;
	class: new (args: TCommandArgs) => T;
};
