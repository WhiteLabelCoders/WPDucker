// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { _ } from '../lodash/lodash.ts';

export async function readUnixMessage(conn: Deno.UnixConn) {
    logger.debugFn(arguments);

    const isBufferFull = (buffer: Uint8Array) => buffer.every((value) => value !== 0);
    let msg = '';
    let totalBytesRead = 0;

    while (true) {
        const buffer = new Uint8Array(1024 * 6);
        const bytesRead = await conn.read(buffer);
        logger.debugVar('buffer', buffer);
        logger.debugVar('bytesRead', bytesRead);

        totalBytesRead += bytesRead || 0;
        logger.debugVar('totalBytesRead', totalBytesRead);

        if (!_.isNull(bytesRead)) {
            const chunk = new TextDecoder().decode(buffer.subarray(0, bytesRead));
            logger.debugVar('chunk', chunk);

            msg = `${msg}${chunk}`;
            logger.debugVar('msg', `${msg}`);
        }

        if (!isBufferFull(buffer) || _.isNull(bytesRead)) {
            break;
        }
    }

    return msg;
}
