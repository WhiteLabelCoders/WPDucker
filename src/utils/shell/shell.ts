// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';

export async function shell(...args: string[]) {
    const cmd = new Deno.Command('command', { args });

    logger.debug(`Shell: execute \`${args.join(' ')}\``);

    const output = await cmd.output();

    if (!output.success) {
        const msg = new TextDecoder().decode(output.stderr);

        logger.error('sh:', msg);
        return false;
    }

    return new TextDecoder().decode(output.stdout);
}
