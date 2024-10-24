// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs, TCommandMeta } from '../../../../classes/command/command.d.ts';
import { classCommand } from '../../../../classes/command/command.ts';
import { DB_PATH } from '../../../../constants/DB_PATH.ts';
import { DB_SERVER_SOCKET_PATH } from '../../../../constants/DB_SERVER_SOCKET_PATH.ts';
import { logger } from '../../../../global/logger.ts';
import { createDatabaseServer } from '../../../../utils/create_database_server/create_database_server.ts';
import { sleep } from '../../../../utils/sleep/sleep.ts';
import { classCommandDbServiceStartDocs } from './start.docs.ts';

const phrase = 'service db start';

class classCommandDbServiceStart extends classCommand {
    public dbServerSocketPath;
    public dbPath;
    public running;
    public dbServer;

    constructor(args: TCommandArgs) {
        logger.debugFn(arguments);

        super(args);

        this.dbServerSocketPath = DB_SERVER_SOCKET_PATH;
        logger.debugVar('dbServerSocketPath', this.dbServerSocketPath);

        this.dbPath = DB_PATH;
        logger.debugVar('dbPath', this.dbPath);

        this.running = false;
        logger.debugVar('running', this.running);

        this.dbServer = this.createDbServer();
        logger.debugVar('dbServer', this.dbServer);
    }

    public createDbServer() {
        logger.debugFn(arguments);

        return createDatabaseServer(this.dbServerSocketPath, this.dbPath);
    }

    public async stopDbServer() {
        logger.debugFn(arguments);

        await this.dbServer.stop();
    }

    public async restartDbServer() {
        logger.debugFn(arguments);

        await this.stopDbServer();
        this.recreateDbServer();
        await this.startDbServer();
    }

    public async startDbServer() {
        logger.debugFn(arguments);

        await this.dbServer.start();
    }

    public recreateDbServer() {
        logger.debugFn(arguments);

        this.dbServer = this.createDbServer();
    }

    public async handleSignalSIGTERM() {
        logger.debugFn(arguments);

        logger.info('SIGTERM signal received - stopping');
        this.running = false;
        await this.stopDbServer();
    }

    public async handleSignalSIGINT() {
        logger.debugFn(arguments);

        await this.handleSignalSIGTERM();
    }

    public async handleSignalSIGHUP() {
        logger.debugFn(arguments);

        logger.info('SIGHUP signal received - restarting');
        await this.restartDbServer();
    }

    public registerOSSignals() {
        logger.debugFn(arguments);

        const handlerSIGTERM = this.handleSignalSIGTERM.bind(this);
        logger.debugVar('handlerSIGTERM', handlerSIGTERM);

        const handlerSIGHUP = this.handleSignalSIGHUP.bind(this);
        logger.debugVar('handlerSIGHUP', handlerSIGHUP);

        const handlerSIGINT = this.handleSignalSIGINT.bind(this);
        logger.debugVar('handlerSIGINT', handlerSIGINT);

        Deno.addSignalListener('SIGTERM', handlerSIGTERM);
        Deno.addSignalListener('SIGHUP', handlerSIGHUP);
        Deno.addSignalListener('SIGINT', handlerSIGINT);

        function unregisterOSSignals() {
            logger.debugFn(arguments);

            Deno.removeSignalListener('SIGTERM', handlerSIGTERM);
            Deno.removeSignalListener('SIGHUP', handlerSIGHUP);
            Deno.removeSignalListener('SIGINT', handlerSIGINT);
        }

        return {
            unregisterOSSignals,
        };
    }

    public unregisterOSSignals() {
        logger.debugFn(arguments);

        Deno.removeSignalListener('SIGTERM', this.handleSignalSIGTERM);
        Deno.removeSignalListener('SIGHUP', this.handleSignalSIGHUP);
        Deno.removeSignalListener('SIGINT', this.handleSignalSIGINT);
    }

    public async exec() {
        logger.debugFn(arguments);

        let _throw: Error | null = null;

        this.running = true;
        logger.debugVar('this.running', this.running);

        await this.startDbServer();

        const { unregisterOSSignals } = this.registerOSSignals();

        try {
            while (this.running) {
                await this.dbServer.listen();
                await sleep(250);
            }
        } catch (error) {
            _throw = error as Error;
        }

        unregisterOSSignals();

        if (_throw) {
            throw _throw;
        }
    }
}

const meta: TCommandMeta<classCommandDbServiceStart> = {
    phrase,
    documentation: classCommandDbServiceStartDocs,
    class: classCommandDbServiceStart,
};

export default meta;
