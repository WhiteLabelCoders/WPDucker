// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { CLI_DIR } from '../../constants/CLI_DIR.ts';
import { logger } from '../../global/logger.ts';
import { getOsAlias } from '../../utils/get_od_alias/get_os_alias.ts';
import { classGitHubApiClient } from '../github/gh_api_client.ts';
import { downloadFile } from '../../utils/download_file/download_file.ts';
import { getCurrentCliVersion } from '../../utils/get_current_cli_version/get_current_cli_version.ts';
import { getCliVersionRequiredByProject } from '../../utils/get_cli_version_required_by_project/get_cli_version_required_by_project.ts';
import { ensureExecutePermissions } from '../../utils/ensure_execute_permissions/ensure_execute_permissions.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { version } from './cli_version_manager.d.ts';
import { shell } from '../../utils/shell/shell.ts';

/* The `classCliVersionManager` class is a TypeScript class that represents the WPDucker Version Manager, which is
responsible for managing the versions of the "wpd" software by downloading and extracting
specific versions from GitHub releases. */
export class classCliVersionManager {
	public gitHubApi;
	public dispatch = false;
	public dispatchTarget: string[] = [];
	public requiredCliVersion: version | undefined;
	public prefferedCliVersion: version | undefined;
	public cliDir;
	public tmpDir;

	/**
	 * The constructor function initializes the GitHub API client, CLI directory, and temporary directory
	 * based on the provided arguments.
	 * @param args - The constructor function takes in an object `args` with the following properties:
	 */
	constructor(
		args: {
			cliDir: typeof CLI_DIR;
			gitHubApiClient: classGitHubApiClient;
			tmpDir: string;
		},
	) {
		logger.debugFn(arguments);

		this.gitHubApi = args.gitHubApiClient;
		logger.debugVar(`this.gitHubApi`, this.gitHubApi);

		this.cliDir = args.cliDir;
		logger.debugVar(`this.cliDir`, this.cliDir);

		this.tmpDir = args.tmpDir;
		logger.debugVar(`this.tmpDir`, this.tmpDir);
	}

	/**
	 * The function `makeCvmDir` creates a directory if it does not already exist using Deno's `mkdir`
	 * function.
	 */
	public async makeCvmDir() {
		logger.debugFn(arguments);

		if (!await pathExist(this.cliDir.main)) {
			logger.debug('Make directory', this.cliDir.main, { recursive: true });
			await Deno.mkdir(this.cliDir.main, { recursive: true });
		}
	}

	/**
	 * The function `resetDispatchValue` sets the `dispatch` property to `false`.
	 */
	public resetDispatchValue() {
		logger.debugFn(arguments);

		this.dispatch = false;
		logger.debugVar(`this.dispatch`, this.dispatch);
	}

	/**
	 * The function `resetDispatchTargetValue` resets the value of the `dispatchTarget` property to an
	 * empty string.
	 */
	public resetDispatchTargetValue() {
		logger.debugFn(arguments);

		this.dispatchTarget = [];
		logger.debugVar(`this.dispatchTarget`, this.dispatchTarget);
	}

	/**
	 * This TypeScript function retrieves the required CLI version for a project, with an optional
	 * preferred version parameter.
	 * @param {version} [prefferedWpdVersion] - The `prefferedWpdVersion` parameter is an optional
	 * parameter that represents the preferred version of the Wpd CLI that the project requires. If
	 * this parameter is provided, the function will use this version. Otherwise, it will call the
	 * `getCliVersionRequiredByProject` function to
	 * @returns The function `getProjectRequiredCliVersion` returns the CLI version required by the
	 * project. If a preferred version (`prefferedWpdVersion`) is provided, it will return that
	 * version. Otherwise, it will asynchronously fetch the CLI version required by the project using the
	 * `getCliVersionRequiredByProject` function and return that version.
	 */
	public async getProjectRequiredCliVersion(prefferedWpdVersion?: version) {
		logger.debugFn(arguments);

		const cliVersionRequiredByProject = prefferedWpdVersion ||
			await getCliVersionRequiredByProject();
		logger.debugVar(`cliVersionRequiredByProject`, cliVersionRequiredByProject);

		return cliVersionRequiredByProject;
	}

	/**
	 * The function `setPrefferdCliVersion` sets the preferred CLI version in TypeScript.
	 * @param {version} prefferedCliVersion - It looks like there is a typo in your method signature. The
	 * parameter should be named "preferredCliVersion" instead of "prefferedCliVersion".
	 */
	public setPrefferdCliVersion(prefferedCliVersion: version) {
		logger.debugFn(arguments);

		this.prefferedCliVersion = prefferedCliVersion;
		logger.debugVar(`this.prefferedCliVersion`, this.prefferedCliVersion);
	}

	/**
	 * This function unsets the preferred CLI version by setting it to undefined.
	 */
	public unsetPrefferdCliVersion() {
		logger.debugFn(arguments);

		this.prefferedCliVersion = undefined;
		logger.debugVar(`this.prefferedCliVersion`, this.prefferedCliVersion);
	}

	/**
	 * The function `autoSetDispatch` asynchronously determines the required CLI version for a project and
	 * sets the dispatch flag accordingly.
	 * @returns No need to change wpd version
	 */
	public async autoSetDispatch() {
		logger.debugFn(arguments);

		const projectRequiredCliVersion = await this.getProjectRequiredCliVersion(
			this.prefferedCliVersion,
		);
		logger.debugVar(`projectRequiredCliVersion`, projectRequiredCliVersion);

		const currentCliVersion = getCurrentCliVersion();
		logger.debugVar(`currentCliVersion`, currentCliVersion);

		this.requiredCliVersion = projectRequiredCliVersion || currentCliVersion;
		logger.debugVar(`this.requiredCliVersion`, this.requiredCliVersion);

		if (!this.requiredCliVersion || currentCliVersion === this.requiredCliVersion) {
			logger.debug(`No need to change wpd version`);
			return;
		}

		this.dispatch = true;
		logger.debugVar(`this.dispatch`, this.dispatch);

		const details = this.getWpdDetails(this.requiredCliVersion);
		logger.debugVar(`details`, details);

		this.dispatchTarget = [details.filename, details.filenameDepreciated];
		logger.debugVar(`this.dispatchTarget`, this.dispatchTarget);

		if (!this.dispatchTarget.length) {
			throw 'No available dispatch target!';
		}
	}

	/**
	 * The `init` function initializes the WPDucker Version Manager by resetting values, creating a
	 * directory, setting dispatch, and ensuring a required CLI version.
	 * @param {version} [prefferedWpdVersion] - The `prefferedWpdVersion` parameter is an optional
	 * input that specifies a preferred version of Wpd to be used during initialization. If provided,
	 * the code will attempt to use this version when setting up the Wpd Version Manager.
	 */
	public async init() {
		logger.debugFn(arguments);

		this.resetDispatchValue();
		this.resetDispatchTargetValue();
		await this.makeCvmDir();
		await this.autoSetDispatch();

		if (!this.dispatchTarget.length) {
			logger.debug(`No dispatch target`);
			return;
		}

		if (!this.requiredCliVersion) {
			throw `Invalid required cli version tagname "${this.requiredCliVersion}"!`;
		}

		await this.ensureVersion(this.requiredCliVersion);
	}

	/**
	 * The function `getWpdDetails` returns the directory name and filename for a specific version of a
	 * tool.
	 * @param {version} tagName - The `tagName` parameter is used to specify the version of the Wpd
	 * details that you want to retrieve. It is used to construct the directory path and filename for the
	 * Wpd details based on the specified version.
	 * @returns {
	 *   dirname: `${this.cliDir.versions}/`,
	 *   filename: `${this.cliDir.versions}//wpd`
	 * }
	 */
	public getWpdDetails(tagName: version) {
		logger.debugFn(arguments);

		const dirname = `${this.cliDir.versions}/${tagName}`;
		logger.debugVar(`dirname`, dirname);

		const filenameDepreciated = `${dirname}/WPDucker`;
		logger.debugVar(`filenameDepreciated`, filenameDepreciated);

		const filename = `${dirname}/wpd`;
		logger.debugVar(`filename`, filename);

		return {
			dirname,
			filename,
			filenameDepreciated,
		};
	}

	/**
	 * This function returns the value of the `dispatch` property and logs it at debug level.
	 * @returns The function shouldOutsourceCmd() is returning the value of the variable shouldDispatch.
	 */
	public shouldOutsourceCmd() {
		logger.debugFn(arguments);

		const shouldDispatch = this.dispatch;
		logger.debugVar(`shouldDispatch`, shouldDispatch);

		return shouldDispatch;
	}

	/**
	 * This TypeScript function returns the dispatch target and logs its value using a debug message.
	 * @returns The `dispatchTarget` variable is being returned.
	 */
	public getDispatchTarget() {
		logger.debugFn(arguments);

		const dispatchTarget = this.dispatchTarget;
		logger.debugVar(`dispatchTarget`, dispatchTarget);

		return dispatchTarget;
	}

	/**
	 * The function `ensureVersion` checks if a specific version of a file exists and downloads it if it
	 * doesn't.
	 * @param {version} tagName - The `tagName` parameter in the `ensureVersion` function represents the
	 * version of a software package or library that needs to be checked and potentially downloaded if it
	 * does not already exist.
	 * @returns If the file for the specified version already exists, the function will return without
	 * downloading the version.
	 */
	public async ensureVersion(tagName: version) {
		logger.debugFn(arguments);

		const filename = this.getWpdDetails(tagName).filename;
		logger.debugVar(`filename`, filename);

		if (await pathExist(filename)) {
			logger.debug(`Wpd version "${tagName}" already exist "${filename}"`);
			return;
		}

		await this.downloadVersion(tagName);
	}

	/**
	 * The function `useLatest` retrieves the latest version of wpd and sets it as the default version.
	 * @returns The function `useLatest` is returning the latest version tag name of the wpd software.
	 */
	public async useLatest() {
		logger.debugFn(arguments);

		const versions = await this.getVersionsList();
		logger.debugVar(`versions`, versions);

		if (!versions.length) {
			throw 'No available wpd version!';
		}

		const latest = versions[0];
		logger.debugVar(`latest`, latest);

		await this.setDefaultVersion(latest.tagName as version);

		return latest.tagName;
	}

	/**
	 * This function returns the directory information stored in the "cliDir" property.
	 * @returns The `cliDir` property is being returned.
	 */
	public getDirInfo() {
		logger.debugFn(arguments);

		const dir = this.cliDir;
		logger.debugVar('dir', dir);

		return dir;
	}

	/**
	 * The function `setDefaultVersion` sets a default version by downloading and managing files based on
	 * the provided version tag.
	 * @param {version} tagName - The `tagName` parameter in the `setDefaultVersion` function represents
	 * the version tag name that you want to set as the default version. This function checks if the
	 * specified version is available, downloads it if it's not already installed, and then updates the
	 * necessary files to make it the default version of the
	 */
	public async setDefaultVersion(tagName: version) {
		logger.debugFn(arguments);

		const availableVersions = (await this.getVersionsList()).map((item) => {
			return item.tagName;
		});
		logger.debugVar('availableVersions', availableVersions);

		if (!availableVersions.includes(tagName)) {
			throw `Version "${tagName}" is not available!`;
		}

		const installedVersions = await this.getInstalledVersions();
		logger.debugVar('installedVersions', installedVersions);

		if (!installedVersions.includes(tagName)) {
			await this.downloadVersion(tagName);
		}

		const wpdVersionFilenameDepreciated = `${this.cliDir.versions}/${tagName}/WPDucker`;
		logger.debugVar('wpdVersionFilenameDepreciated', wpdVersionFilenameDepreciated);

		const wpdVersionFilename = `${this.cliDir.versions}/${tagName}/wpd`;
		logger.debugVar('wpdVersionFilename', wpdVersionFilename);

		if (await pathExist(wpdVersionFilenameDepreciated)) {
			logger.debug('Rename', wpdVersionFilenameDepreciated, wpdVersionFilename);
			await Deno.rename(wpdVersionFilenameDepreciated, wpdVersionFilename);
		}

		const wpdFilename = `${this.cliDir.main}/wpd`;
		logger.debugVar('wpdFilename', wpdFilename);

		const wpdTmpFilename = `${this.cliDir.main}/tmp_wpd`;
		logger.debugVar('wpdTmpFilename', wpdTmpFilename);

		const wpdToRmFilename = `${this.cliDir.main}/rm_wpd`;
		logger.debugVar('wpdToRmFilename', wpdToRmFilename);

		if (await pathExist(wpdTmpFilename)) {
			logger.debug(`Remove`, wpdTmpFilename);
			Deno.removeSync(wpdTmpFilename);
		}

		if (await pathExist(wpdToRmFilename)) {
			logger.debug(`Remove`, wpdToRmFilename);
			Deno.removeSync(wpdToRmFilename);
		}

		logger.debug('Copy', wpdVersionFilename, wpdTmpFilename);
		Deno.copyFileSync(wpdVersionFilename, wpdTmpFilename);

		if (await pathExist(wpdFilename)) {
			logger.debug('Rename', wpdFilename, wpdToRmFilename);
			Deno.renameSync(wpdFilename, wpdToRmFilename);
		}

		logger.debug('Rename', wpdTmpFilename, wpdFilename);
		Deno.renameSync(wpdTmpFilename, wpdFilename);

		if (await pathExist(wpdToRmFilename)) {
			logger.debug('Remove', wpdToRmFilename);
			Deno.removeSync(wpdToRmFilename);
		}
	}

	/**
	 * This function retrieves a list of installed versions by comparing available versions with
	 * directories in a specified path.
	 * @returns The `getInstalledVersions` function returns an array of strings representing the installed
	 * versions of a CLI tool.
	 */
	public async getInstalledVersions() {
		logger.debugFn(arguments);

		const installedVersions: string[] = [];
		logger.debugVar('installedVersions', installedVersions);

		const availableVersions = (await this.getVersionsList()).map((item) => {
			return item.tagName;
		});
		logger.debugVar('availableVersions', availableVersions);

		if (await pathExist(this.cliDir.versions)) {
			for (const dirEntry of Deno.readDirSync(this.cliDir.versions)) {
				const dirname = availableVersions.includes(dirEntry.name as version)
					? dirEntry.name
					: false;
				logger.debugVar('dirname', dirname);

				if (dirname) {
					installedVersions.push(dirname);
					logger.debugVar('installedVersions', installedVersions);
				}
			}
		}

		return installedVersions;
	}

	/**
	 * This function fetches a list of versions from GitHub releases, extracts relevant information, and
	 * sorts them by published date.
	 * @returns The `getVersionsList` function returns a list of versions fetched from the GitHub API.
	 * Each version object in the list contains a `tagName` property representing the version tag name and
	 * a `publishedDate` property representing the published date of the version. The list is sorted in
	 * descending order based on the published date of each version.
	 */
	public async getVersionsList() {
		logger.debugFn(arguments);

		const releases = await this.gitHubApi.fetchReleases();
		logger.debugVar('releases', releases);

		const releasesMapped = releases?.map((item) => {
			const publishedDate = item.published_at
				? new Date(item.published_at).getTime()
				: undefined;

			return {
				tagName: item.tag_name as version,
				publishedDate,
			};
		});
		logger.debugVar('releasesMapped', releasesMapped);

		const releasesSorted = releasesMapped.sort((a, b) => {
			if (!a.publishedDate || !b.publishedDate) {
				return 0;
			}

			return b.publishedDate - a.publishedDate;
		});
		logger.debugVar('releasesSorted', releasesSorted);

		return releasesSorted;
	}

	/**
	 * The function `downloadVersion` downloads a specific version of a software package, extracts it, and
	 * ensures execute permissions on the files.
	 * @param {version} tagName - The `tagName` parameter in the `downloadVersion` function represents the
	 * version of the "wpd" software that you want to download. It is used to fetch the release
	 * information and assets corresponding to that specific version from GitHub.
	 */
	public async downloadVersion(tagName: version) {
		logger.debugFn(arguments);

		const release = await this.gitHubApi.fetchReleaseByTagName(tagName);
		logger.debugVar('release', release);

		if (!release) {
			throw `Not found release "${tagName}" version!`;
		}

		const osAlias = getOsAlias();
		logger.debugVar('osAlias', osAlias);

		if (osAlias === 'Os not recognized') {
			throw osAlias;
		}

		const releaseUrlForCurrentOS = release.assets.find((asset) =>
			asset.name == `${osAlias}.zip`
		)?.browser_download_url;
		logger.debugVar('releaseUrlForCurrentOS', releaseUrlForCurrentOS);

		if (!releaseUrlForCurrentOS) {
			throw `Not found download url for wpd "${tagName}" version!`;
		}

		logger.info(`Download wpd version "${tagName}" from "${releaseUrlForCurrentOS}"`);

		const tmpDir = this.tmpDir;
		logger.debugVar('tmpDir', tmpDir);

		if (!tmpDir) {
			throw `Invalid session tmp dir "${tmpDir}"!`;
		}

		const downloadDetails = await downloadFile({
			saveToFile: true,
			returnFileContent: false,
			url: releaseUrlForCurrentOS,
			destDir: tmpDir,
		});
		logger.debugVar('downloadDetails', downloadDetails);

		if (!downloadDetails.filename) {
			throw 'Downloaded filename is incorrect!';
		}

		if (!await pathExist(downloadDetails.filename)) {
			throw `Downloaded zip is missing!`;
		}

		const destDir = this.getWpdDetails(tagName).dirname;
		logger.debugVar('destDir', destDir);

		if (await pathExist(destDir)) {
			logger.debug('Remove', destDir);
			await Deno.remove(destDir, { recursive: true });
		}

		if (!await pathExist(destDir)) {
			logger.debug('Make directory', destDir);
			await Deno.mkdir(destDir, { recursive: true });
		}

		logger.info(`Extracting into ${destDir}`);

		await shell(...['unzip', downloadDetails.filename, '-d', destDir]);

		for (const dirEntry of Deno.readDirSync(destDir)) {
			logger.debugVar('dirEntry', dirEntry);
			if (!dirEntry.isFile) continue;

			ensureExecutePermissions(`${destDir}/${dirEntry.name}`);
		}

		logger.info(`"Wpd ${tagName} downloaded"`);
	}
}
