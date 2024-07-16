// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classCliVersionManager } from '../classes/cli_version_manager/cli_version_manager.ts';
import { classDatabase } from '../classes/database/database.ts';
import classDependencyChecker from '../classes/dependency_checker/dependency_checker.ts';
import { classGitHubApiClient } from '../classes/github/gh_api_client.ts';
import { CLI_DIR } from '../constants/CLI_DIR.ts';
import { logger } from '../global/logger.ts';
import { generateUniqueBasename } from '../utils/generate_unique_basename/generate_unique_basename.ts';

await (async function installer() {
	const tmpDir = `${CLI_DIR.tmp}/${await generateUniqueBasename({ basePath: CLI_DIR.tmp })}`;
	const database = new classDatabase({ dirname: `${CLI_DIR.localStorage}` });
	const gitHubApiClient = new classGitHubApiClient({
		github: {
			owner: 'WhiteLabelCoders',
			repo: 'WPDucker',
			apiUrl: 'https://api.github.com',
		},
		database,
	});
	const cliVersionManager = new classCliVersionManager({
		cliDir: CLI_DIR,
		gitHubApiClient,
		tmpDir,
	});

	logger.info('Initialize installer');
	await cliVersionManager.init();

	logger.info('Install latest version of wpd');
	const latest = await cliVersionManager.useLatest();

	const shell = Deno.env.get('SHELL');

	logger.info(`Add wpd path to shell profile "${shell}"`);

	let profile = '';
	switch (shell) {
		case '/bin/zsh':
			profile = '.zshrc';
			break;

		case '/bin/bash':
			profile = '.bashrc';
			break;

		default:
			logger.error(
				`Not supported shell "${shell}"! Please add manually wpd path "${cliVersionManager.getDirInfo().main}" to your shell profile (${shell})`,
			);
			break;
	}

	if (profile) {
		const profileFilename = `${Deno.env.get('HOME')}/${profile}`;
		const profileContent = Deno.readTextFileSync(profileFilename);
		const beginWpdContent = '# WPD - BEGIN';
		const endWpdContent = '# WPD - END';
		const newContent: string[] = [];
		let wpdContentBoolean = false;
		const splitedProfileContent = profileContent.split('\n');

		splitedProfileContent.forEach((line, index) => {
			const isLastLine = index == splitedProfileContent.length - 1;

			if (line.includes(beginWpdContent)) {
				wpdContentBoolean = true;
			}

			if (wpdContentBoolean == false && !(isLastLine && line === '')) {
				newContent.push(`${line}`);
			}

			if (line.includes(endWpdContent)) {
				wpdContentBoolean = false;
			}
		});

		const addUninffoToPATH: string[] = [];

		addUninffoToPATH.push(`${beginWpdContent}`);
		addUninffoToPATH.push(`PATH="\${PATH}:${cliVersionManager.getDirInfo().main}"`);
		addUninffoToPATH.push(`${endWpdContent}`);

		newContent.push(...addUninffoToPATH);

		logger.info(
			`Add: \n${addUninffoToPATH.join('\n')}\n To shell profile file "${profileFilename}"`,
		);
		Deno.writeTextFileSync(profileFilename, `${newContent.join('\n')}\n`);
	}

	logger.success(
		`Wpd ${latest} successfully installed. Please restart terminal and try to execute "wpd"`,
	);

	classDependencyChecker.check();
})();
