import { _ } from '../../utils/lodash/lodash.ts';
import { logger } from '../../global/logger.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { compile, tql } from 'jsr:@arekx/teeql';
import { readUnixMessage } from '../../utils/read_unix_message/read_unix_message.ts';

export class classDatabaseClient {
    public unixSocket: string;

    constructor(args: { unixSocket: string }) {
        logger.debugFn(arguments);

        const { unixSocket } = args;

        this.unixSocket = unixSocket;
        logger.debugVar('this.unixSocket', this.unixSocket);
    }

    async connect() {
        logger.debugFn(arguments);

        if (!await pathExist(this.unixSocket)) {
            throw `Database client cannot connect to server! Unix socket does not exist: ${this.unixSocket}`;
        }

        const connection = Deno.connect({
            path: this.unixSocket,
            transport: 'unix',
        });
        logger.debugVar('connection', connection);

        logger.info(`Connected to database server!`);

        return connection;
    }

    async request<T>(connection: Deno.UnixConn, query: string) {
        logger.debugFn(arguments);

        let _throw: Error | undefined = undefined;
        let _response: string | undefined = undefined;

        try {
            logger.debug(`Sending query: ${query}`);

            const unit8ArrayQuery = new TextEncoder().encode(query);
            logger.debugVar('unit8ArrayQuery', unit8ArrayQuery);

            await connection.write(unit8ArrayQuery);

            const response = await readUnixMessage(connection);
            logger.debugVar('response', response);

            if (response.startsWith('WPD db service: unexpected error:')) {
                throw response;
            }

            _response = response;
        } catch (error) {
            _throw = error;
        }

        connection.close();
        logger.info(`Connection closed!`);

        if (!_.isUndefined(_throw)) {
            throw _throw;
        }

        if (_.isUndefined(_response)) {
            throw `Response for query is undefined! Query: ${query}`;
        }

        return JSON.parse(_response) as T;
    }

    async query<T>(strings: TemplateStringsArray, ...expressions: any[]) {
        logger.debugFn(arguments);

        const query = compile(tql(strings, ...expressions));

        const connection = await this.connect();
        logger.debugVar('connection', connection);

        const request = await this.request<T[]>(connection, JSON.stringify(query));
        logger.debugVar('request', request);

        if (_.isUndefined(request)) {
            throw `Response for query is undefined! Query: ${query}`;
        }

        return request;
    }
}
