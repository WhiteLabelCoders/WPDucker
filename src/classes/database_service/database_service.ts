// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import meta from '../../commands/service/db/start/start.ts';
import { CLI_DIR } from '../../constants/CLI_DIR.ts';
import { logger } from '../../global/logger.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { shell } from '../../utils/shell/shell.ts';

export class classDatabaseService {
    private name: string;
    private execPath: string = '';
    private description: string = '';
    private homeDir: string;

    constructor(args: { name: string; description: string; execPath: string; homeDir?: string }) {
        logger.debugFn(arguments);

        this.name = args.name;
        logger.debugVar(`this.name`, this.name);

        this.execPath = args.execPath;
        logger.debugVar(`this.execPath`, this.execPath);

        this.description = args.description;
        logger.debugVar(`this.description`, this.description);

        const _homeDir = args.homeDir || Deno.env.get('HOME');

        if (!_.isString(_homeDir)) {
            throw `Home directory is invalid '${_homeDir}'!`;
        }

        this.homeDir = _homeDir;
    }

    public async install(run: boolean = true) {
        logger.debugFn(arguments);

        await this.createServiceFile();

        if (run) {
            await this.startService();
        }
    }

    public getServiceFilePath() {
        logger.debugFn(arguments);

        const os = Deno.build.os;
        logger.debugVar('os', os);

        switch (os) {
            case 'darwin':
                return `${this.homeDir}/Library/LaunchAgents/${this.name}.plist`;

            case 'linux':
                return `${this.homeDir}/.config/systemd/user/${this.name}.service`;

            default:
                return;
        }
    }

    public getServiceFileContent() {
        logger.debugFn(arguments);

        const os = Deno.build.os;
        logger.debugVar('os', os);

        switch (os) {
            case 'darwin':
                return this.generateServiceFileContentForDarwin();

            case 'linux':
                return this.generateServiceFileContentForLinux();

            default:
                return;
        }
    }

    public async createServiceFile() {
        logger.debugFn(arguments);

        const serviceFilePath = this.getServiceFilePath();
        logger.debugVar('serviceFilePath', serviceFilePath);

        const serviceFileContent = this.getServiceFileContent();
        logger.debugVar('serviceFileContent', serviceFileContent);

        if (!serviceFilePath || !serviceFileContent) {
            throw `Unsupported OS: ${Deno.build.os}`;
        }

        let currentContent = '';
        logger.debugVar('currentContent', currentContent);

        if (await pathExist(serviceFilePath)) {
            currentContent = await Deno.readTextFile(serviceFilePath);
            logger.debugVar('currentContent', currentContent);
        }

        if (currentContent === serviceFileContent) {
            logger.info(`Service file already exists: ${serviceFilePath}`);
            return;
        }

        const serviceFileDirPath = serviceFilePath.substring(0, serviceFilePath.lastIndexOf('/'));
        logger.debugVar('serviceFileDirPath', serviceFileDirPath);

        if (!(await pathExist(serviceFileDirPath))) {
            logger.info(`Creating directory: ${serviceFileDirPath}`);
            await Deno.mkdir(serviceFileDirPath, { recursive: true });
        }

        logger.info(`Creating service file: ${serviceFilePath}`);
        await Deno.writeTextFile(serviceFilePath, serviceFileContent);
    }

    public generateServiceFileContentForDarwin() {
        logger.debugFn(arguments);

        const cmdStartArgs = meta.phrase.split(' ');
        logger.debugVar('cmdStartArgs', cmdStartArgs);

        const nl = '\r\n';
        let content = '';
        content += `<?xml version="1.0" encoding="UTF-8"?>${nl}`;
        content +=
            `<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd" >${nl}`;
        content += `<plist version="1.0">${nl}`;
        content += `    <dict>${nl}`;
        content += `        <key>Label</key>${nl}`;
        content += `        <string>${this.name}</string>${nl}`;
        content += `        <key>Description</key>${nl}`;
        content += `        <string>${this.description}</string>${nl}`;
        content += `        <key>ProgramArguments</key>${nl}`;
        content += `        <array>${nl}`;
        content += `            <string>${this.execPath}</string>${nl}`;
        for (const arg of cmdStartArgs) {
            content += `            <string>${arg}</string>${nl}`;
        }
        content += `        </array>${nl}`;
        content += `        <key>RunAtLoad</key>${nl}`;
        content += `        <true/>${nl}`;
        content += `        <key>KeepAlive</key>${nl}`;
        content += `        <true/>${nl}`;
        content += `        <key>ThrottleInterval</key>${nl}`;
        content += `        <integer>60</integer>${nl}`;
        content += `        <key>StandardOutPath</key>${nl}`;
        content +=
            `        <string>${CLI_DIR.localStorage}/logs/std/${this.name}.out.log</string>${nl}`;
        content += `        <key>StandardErrorPath</key>${nl}`;
        content +=
            `        <string>${CLI_DIR.localStorage}/logs/std/${this.name}.err.log</string>${nl}`;
        content += `    </dict>${nl}`;
        content += `</plist>${nl}`;
        content += ``;

        logger.debugVar('content', content);
        return content;
    }

    public generateServiceFileContentForLinux() {
        logger.debugFn(arguments);

        const nl = '\r\n';
        let content = '';
        content += `[Unit]${nl}`;
        content += `Description=${this.description}${nl}`;
        content += `${nl}`;
        content += `[Service]${nl}`;
        content += `ExecStart=${this.execPath} ${meta.phrase}${nl}`;
        content += `Restart=always${nl}`;
        content += `RestartSec=5${nl}`;
        content += `StartLimitBurst=3${nl}`;
        content += `StartLimitIntervalSec=60${nl}`;
        content +=
            `StandardOutput=append:${CLI_DIR.localStorage}/logs/std/${this.name}.out.log${nl}`;
        content +=
            `StandardError=append:${CLI_DIR.localStorage}/logs/err/${this.name}.err.log${nl}`;
        content += `${nl}`;
        content += `[Install]${nl}`;
        content += `WantedBy=default.target${nl}`;

        logger.debugVar('content', content);
        return content;
    }

    public startService() {
        logger.debugFn(arguments);

        const os = Deno.build.os;
        logger.debugVar('os', os);

        switch (os) {
            case 'darwin':
                return this.startServiceForDarwin();

            case 'linux':
                return this.startServiceForLinux();

            default:
                return;
        }
    }

    public async startServiceForDarwin() {
        logger.debugFn(arguments);

        const cmd = [`launchctl`, `load`, `${this.getServiceFilePath()}`];
        logger.debugVar('cmd', cmd);

        const result = await shell(...cmd);
        logger.info('Start database service for Darwin os:', result);
    }

    public async startServiceForLinux() {
        logger.debugFn(arguments);

        const cmd = [`systemctl`, `start`, `${this.getServiceFilePath()}`];
        logger.debugVar('cmd', cmd);

        const result = await shell(...cmd);
        logger.info('Start database service for Linux os:', result);
    }
}
