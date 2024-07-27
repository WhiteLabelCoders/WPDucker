import { classCommand } from '../../classes/command/command.ts';
import { COMMANDS_META } from '../../pre_compiled/__commands_meta.ts';
import { parseCliArgs } from '../parser/parser.ts';

/**
 * Prepares and returns a command object based on the provided command phrase and arguments.
 * @template T - The type of the command object to be returned.
 * @param {string} cmdPhrase - The command phrase.
 * @param {string[]} args - The command arguments.
 * @returns {classCommand} - The prepared command object.
 * @throws {string} - Throws an error if the command phrase is not found in the COMMANDS_META array.
 */
export function prepareCmd(cmdPhrase: string, args: string[]): classCommand {
    const cmdMeta = COMMANDS_META.find((item) => item.phrase === cmdPhrase);

    if (!cmdMeta) {
        throw `Can not find command by phrase "${cmdPhrase}"!`;
    }

    const cmd = new cmdMeta.class(
        {
            commandArgs: parseCliArgs([cmdPhrase, ...args]),
            documentation: cmdMeta.documentation,
        },
    );

    return cmd;
}
