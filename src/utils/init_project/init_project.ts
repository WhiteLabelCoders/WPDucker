// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { COMMANDS_META } from '../../pre_compiled/__commands_meta.ts';
import { parseCliArgs } from '../parser/parser.ts';
import _commandMetaInit from './../../commands/project/init/init.ts';

export async function initProject(projectName: string) {
    const commandMetaInit = COMMANDS_META.find((item) => item.phrase === _commandMetaInit.phrase);

    if (!commandMetaInit) {
        throw `Can not find init command by phrase "${_commandMetaInit.phrase}"!`;
    }

    const args: string[] = [
        commandMetaInit.phrase,
        '--debug',
        `--project-name="${projectName}"`,
        `--no-change-dir`,
    ];
    const commandInit = new commandMetaInit.class(
        {
            commandArgs: parseCliArgs(args),
            documentation: commandMetaInit.documentation,
        },
    );

    await commandInit._exec();
}
