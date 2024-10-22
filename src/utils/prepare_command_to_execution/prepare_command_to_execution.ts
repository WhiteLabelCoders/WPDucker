// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandMeta } from '../../classes/command/command.d.ts';
import { logger } from '../../global/logger.ts';
import { parseCliArgs } from '../parser/parser.ts';

/**
 * The function `prepareCmd` takes in command metadata and arguments, creates a new command instance
 * based on the metadata, and returns it.
 * @param meta - `meta` is an object containing metadata for a command. It includes information such as
 * the class of the command, the command phrase, and documentation for the command.
 * @param {string[]} args - The `args` parameter in the `prepareCmd` function is an array of strings
 * that represent the command line arguments passed to the function. These arguments will be used along
 * with the command metadata (`meta`) to prepare and create a new command instance.
 * @returns An instance of a command object is being returned.
 */
export function prepareCmd<T>(meta: TCommandMeta<T>, args: string[]) {
    logger.debugFn(arguments);
    const cmdMeta = meta;

    if (!cmdMeta) {
        throw `Can not find command!`;
    }

    const _class = cmdMeta.class;

    const cmd = new _class(
        {
            commandArgs: parseCliArgs([...cmdMeta.phrase.split(' '), ...args]),
            documentation: cmdMeta.documentation,
        },
    );

    return cmd;
}
