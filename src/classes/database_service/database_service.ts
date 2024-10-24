// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import meta from '../../commands/service/db/start/start.ts';
import { CLI_DIR } from '../../constants/CLI_DIR.ts';
import { logger } from '../../global/logger.ts';
import { _ } from '../../utils/lodash/lodash.ts';
import { pathExist, pathExistSync } from '../../utils/path_exist/path_exist.ts';
import { shell } from '../../utils/shell/shell.ts';

export class classDatabaseService {
	private inputName;
	private execPath;
	private execArgs;
	private description;
	private homeDir;
	private stdOutPath;
	private stdErrPath;

	constructor(
		args: {
			name: string;
			description: string;
			execPath: string;
			execArgs: string[];
			homeDir?: string;
			stdOutPath: string;
			stdErrPath: string;
		},
	) {
		logger.debugFn(arguments);

		this.inputName = args.name;
		logger.debugVar(`this.inputName`, this.inputName);

		this.execPath = args.execPath;
		logger.debugVar(`this.execPath`, this.execPath);

		this.execArgs = args.execArgs;
		logger.debugVar(`this.execArgs`, this.execArgs);

		this.description = args.description;
		logger.debugVar(`this.description`, this.description);

		const _homeDir = args.homeDir || Deno.env.get('HOME');

		if (!_.isString(_homeDir)) {
			throw `Home directory is invalid '${_homeDir}'!`;
		}

		this.homeDir = _homeDir;

		this.stdOutPath = args.stdOutPath;
		logger.debugVar(`this.stdOutPath`, this.stdOutPath);

		this.stdErrPath = args.stdErrPath;
		logger.debugVar(`this.stdErrPath`, this.stdErrPath);
	}

	public async install(run: boolean = true) {
		logger.debugFn(arguments);

		await this.createServiceFile();

		if (run) {
			await this.startService();
		}
	}

	public async uninstall() {
		logger.debugFn(arguments);

		await this.stopService();

		const filePath = this.getServiceFilePath();
		logger.debugVar('filePath', filePath);

		if (!filePath) {
			throw `Unsupported OS: ${Deno.build.os}`;
		}

		if (await pathExist(filePath)) {
			Deno.removeSync(filePath);
			logger.info(`Service file removed: ${filePath}`);
		}
	}

	public getServiceFilePath() {
		logger.debugFn(arguments);

		const os = Deno.build.os;
		logger.debugVar('os', os);

		switch (os) {
			case 'darwin':
				return `${this.homeDir}/Library/LaunchAgents/${this.getServiceName()}.plist`;

			case 'linux':
				return `${this.homeDir}/.config/systemd/user/${this.getServiceName()}.service`;

			default:
				throw `Unsupported OS: ${os}`;
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
				throw `Unsupported OS: ${os}`;
		}
	}

	public getServiceName() {
		logger.debugFn(arguments);

		const os = Deno.build.os;
		logger.debugVar('os', os);

		switch (os) {
			case 'darwin':
				return `com.wpd.${this.inputName}`;

			case 'linux':
				return `${this.inputName}`;

			default:
				throw `Unsupported OS: ${os}`;
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

		const serviceFileDirPath = serviceFilePath.substring(0, serviceFilePath.lastIndexOf('/'));
		logger.debugVar('serviceFileDirPath', serviceFileDirPath);

		if (!(await pathExist(serviceFileDirPath))) {
			logger.info(`Creating directory: ${serviceFileDirPath}`);
			await Deno.mkdir(serviceFileDirPath, { recursive: true });
		}

		logger.info(`Creating service file: ${serviceFilePath}`);
		await Deno.writeTextFile(serviceFilePath, serviceFileContent, { create: true });

		Deno.chmodSync(serviceFilePath, 0o644);
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
		content += `        <string>${this.getServiceName()}</string>${nl}`;
		content += `        <key>Description</key>${nl}`;
		content += `        <string>${this.description}</string>${nl}`;
		content += `        <key>ProgramArguments</key>${nl}`;
		content += `        <array>${nl}`;
		content += `            <string>${this.execPath}</string>${nl}`;
		for (const arg of this.execArgs) {
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
		content += `        <string>${this.stdOutPath}</string>${nl}`;
		content += `        <key>StandardErrorPath</key>${nl}`;
		content += `        <string>${this.stdErrPath}</string>${nl}`;
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
			`StandardOutput=append:${CLI_DIR.localStorage}/logs/std/${this.getServiceName()}.out.log${nl}`;
		content +=
			`StandardError=append:${CLI_DIR.localStorage}/logs/err/${this.getServiceName()}.err.log${nl}`;
		content += `${nl}`;
		content += `[Install]${nl}`;
		content += `WantedBy=default.target${nl}`;

		logger.debugVar('content', content);
		return content;
	}

	public ensureLogsFiles() {
		logger.debugFn(arguments);

		if (!pathExistSync(this.stdErrPath)) {
			logger.debug(`Creating file: ${this.stdErrPath}`);
			Deno.writeTextFileSync(this.stdErrPath, '');
		}

		if (!pathExistSync(this.stdOutPath)) {
			logger.debug(`Creating file: ${this.stdOutPath}`);
			Deno.writeTextFileSync(this.stdOutPath, '');
		}
	}

	public startService() {
		logger.debugFn(arguments);

		const os = Deno.build.os;
		logger.debugVar('os', os);

		this.ensureLogsFiles();

		switch (os) {
			case 'darwin':
				return this.startServiceForDarwin();

			case 'linux':
				return this.startServiceForLinux();

			default:
				throw `Unsupported OS: ${os}`;
		}
	}

	public stopService() {
		logger.debugFn(arguments);

		const os = Deno.build.os;
		logger.debugVar('os', os);

		switch (os) {
			case 'darwin':
				return this.stopServiceForDarwin();

			case 'linux':
				return this.stopServiceForLinux();

			default:
				throw `Unsupported OS: ${os}`;
		}
	}

	public async getOsUserId() {
		logger.debugFn(arguments);

		const uid = (await shell('id', '-u')).trim();
		logger.debugVar('uid', uid);

		return uid;
	}

	public async isServiceLoaded() {
		logger.debugFn(arguments);

		let serviceIsLoaded = false;

		const os = Deno.build.os;
		logger.debugVar('os', os);

		switch (os) {
			case 'darwin':
				try {
					await shell(
						'launchctl',
						'print',
						`gui/${await this.getOsUserId()}/${this.getServiceName()}`,
					);
					serviceIsLoaded = true;
				} catch (error) {
					serviceIsLoaded = false;
				}
				break;
			case 'linux':
				try {
					await shell(
						'systemctl',
						'--user',
						'is-enabled',
						this.getServiceName(),
					);
					serviceIsLoaded = true;
				} catch (error) {
					serviceIsLoaded = false;
				}
				break;

			default:
				throw `Unsupported OS: ${os}`;
		}

		logger.debugVar('serviceIsLoaded', serviceIsLoaded);

		return serviceIsLoaded;
	}

	public async startServiceForDarwin() {
		logger.debugFn(arguments);

		if (await this.isServiceLoaded()) {
			await this.stopServiceForDarwin();
		}

		await shell(...[`launchctl`, `load`, `-w`, `${this.getServiceFilePath()}`]);
	}

	public async startServiceForLinux() {
		logger.debugFn(arguments);

		if (await this.isServiceLoaded()) {
			await this.stopServiceForLinux();
		}

		await shell(...[`systemctl`, '--user', `enable`, `${this.getServiceName()}`]);

		await shell(...[`systemctl`, '--user', `start`, `${this.getServiceName()}`]);
	}

	public async stopServiceForDarwin() {
		logger.debugFn(arguments);

		await shell(...[`launchctl`, `unload`, `-w`, `${this.getServiceFilePath()}`]);
	}

	public async stopServiceForLinux() {
		logger.debugFn(arguments);

		await shell(...[`systemctl`, '--user', `stop`, `${this.getServiceName()}`]);

		await shell(...[`systemctl`, '--user', `disable`, `${this.getServiceName()}`]);
	}
}
