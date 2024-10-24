// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';

/**
 * Executes a shell command and returns the output.
 * @param args - The command and its arguments.
 * @returns The output of the command if successful, otherwise false.
 */
export async function shell(...args: string[]) {
    const cmd = new Deno.Command(args[0], { args: args.slice(1) });

    logger.debug(`Shell: execute \`${args.join(' ')}\``);

    const output = await cmd.output();

    if (!output.success) {
        const msg = new TextDecoder().decode(output.stderr);

        throw new Error(`Shell: failed to execute \`${args.join(' ')}\` with error: ${msg}`);
    }

    return new TextDecoder().decode(output.stdout);
}
