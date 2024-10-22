import { logger } from '../../global/logger.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classDatabaseSqlLite } from '../database_sqllite/database_sqllite.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { readUnixMessage } from '../../utils/read_unix_message/read_unix_message.ts';
import { sleep } from '../../utils/sleep/sleep.ts';

export class classDatabaseServer {
    public unixSocket: string;
    public sqlLiteDatabase: classDatabaseSqlLite;
    public totalClients = 0;
    public listener?: Deno.UnixListener;
    public listening = false;

    constructor(args: { unixSocket: string; sqlLiteDatabase: classDatabaseSqlLite }) {
        logger.debugFn(arguments);

        const { unixSocket, sqlLiteDatabase } = args;

        this.unixSocket = unixSocket;
        logger.debugVar('this.unixSocket', this.unixSocket);

        this.sqlLiteDatabase = sqlLiteDatabase;
        logger.debugVar('this.sqlLiteDatabase', this.sqlLiteDatabase);
    }

    async ensureUnixSocketDoesNotExist() {
        logger.debugFn(arguments);

        if (!await pathExist(this.unixSocket)) {
            return;
        }

        logger.info(`Removing existing unix socket: ${this.unixSocket}`);
        Deno.removeSync(this.unixSocket);
    }

    async start() {
        logger.debugFn(arguments);

        await this.ensureUnixSocketDoesNotExist();

        this.listener = Deno.listen({
            path: this.unixSocket,
            transport: 'unix',
        });
        logger.debugVar('this.listener', this.listener);

        logger.success(`Server is started!`);
    }

    async stop() {
        logger.debugFn(arguments);

        if (!this.listener) {
            throw `Server is not started!`;
        }

        this.listener.close();
        logger.success(`Server is stopped!`);

        if (await pathExist(this.unixSocket)) {
            Deno.removeSync(this.unixSocket);
        }

        this.sqlLiteDatabase.destroy();
    }

    async listen() {
        logger.debugFn(arguments);

        if (this.listening) {
            logger.info('Server is already listening');
            return;
        }

        if (!this.listener) {
            throw `Server is not started!`;
        }

        this.listening = true;
        logger.debugVar('this.listening', this.listening);

        for await (const conn of this.listener) {
            while (this.totalClients > 0) {
                await sleep(50);
            }
            try {
                await this.handleConnection(conn);
            } catch (error) {
                logger.error(error);
            }
        }

        this.listening = false;
        logger.debugVar('this.listening', this.listening);
    }
    async handleConnection(conn: Deno.UnixConn) {
        logger.debugFn(arguments);

        this.totalClients++;
        logger.info(`New client connected. Total clients: ${this.totalClients}`);

        const message = await readUnixMessage(conn);
        logger.debugVar('message', message);

        if (message) {
            switch (message) {
                case 'status': {
                    const response = `WPD db service: OK`;
                    logger.debugVar('response', response);

                    await conn.write(new TextEncoder().encode(response));

                    break;
                }
                default: {
                    let response = '';
                    const query = JSON.parse(message);
                    logger.debugVar('query', query);

                    try {
                        switch (this.getQueryType(query.sql)) {
                            case 'INSERT':
                                this.sqlLiteDatabase.provider.queryEntries(query.sql, query.params);
                                response = JSON.stringify(
                                    this.sqlLiteDatabase.provider.queryEntries(
                                        `SELECT last_insert_rowid() as LAST_INSERT_ROW_ID;`,
                                    ),
                                );
                                break;

                            default:
                                response = JSON.stringify(
                                    this.sqlLiteDatabase.provider.queryEntries(
                                        query.sql,
                                        query.params,
                                    ),
                                );
                                break;
                        }
                    } catch (error) {
                        response = `WPD db service: unexpected error: ${
                            JSON.stringify((error as Error).message)
                        }`;
                    }

                    logger.debugVar('response', response);

                    await conn.write(new TextEncoder().encode(response));

                    break;
                }
            }
        } else {
            logger.info(`No data received`);
        }

        conn.close();

        this.totalClients--;
        logger.info(`Client disconnected. Total clients: ${this.totalClients}`);
    }

    getQueryType(query: string) {
        query = query.replace(/\/\*[\s\S]*?\*\//g, '');
        query = query.replace(/--.*$/gm, '');
        query = query.trim();
        const match = query.match(/^\s*(\w+)/i);
        if (match) {
            return match[1].toUpperCase();
        } else {
            return null;
        }
    }
}
