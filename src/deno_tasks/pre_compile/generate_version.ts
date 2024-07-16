// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';

const cliVersionTsFile = async (versionFile: string, versionTsFile: string) => {
	if (!await pathExist(versionFile)) {
		await Deno.writeTextFile(versionFile, `0.0.0`);
	}

	if (await pathExist(versionFile)) {
		const version = await Deno.readTextFile(versionFile);
		logger.debug(`Var version: "${version}"`);

		const moduleContent = `export const cliVersion = "${version}";`;
		logger.debug(`Var moduleContent: "${moduleContent}"`);

		logger.debug(`Write module "${versionTsFile}"`);
		Deno.writeTextFileSync(versionTsFile, moduleContent);
	}
};

const generateVersionFile = (versionFile: string) => {
	// Init
	let error = '';

	const getLatestReleaseTag = './.github/workflows/shell-scripts/get_latest_release_tag.sh';
	const getNewReleaseCommitsRange =
		'./.github/workflows/shell-scripts/get_new_release_commits_range.sh';
	const getNextSemanticVersion = './.github/workflows/shell-scripts/get_next_semantic_version.sh';

	const textDecoder = new TextDecoder();

	// Get latest release tag
	const latestReleaseTagCmd = new Deno.Command(getLatestReleaseTag, { args: ['*.*.*'] })
		.outputSync();
	const latestReleaseTag = textDecoder.decode(
		latestReleaseTagCmd.stdout,
	).trim();

	error = textDecoder.decode(
		latestReleaseTagCmd.stderr,
	);

	if (error) throw error;

	logger.debug(`latestReleaseTag: "${latestReleaseTag}"`);

	// Get commits range
	const commitsRangeCmd = new Deno.Command(getNewReleaseCommitsRange, {
		args: [latestReleaseTag, 'main'],
	}).outputSync();
	const commitsRange = textDecoder.decode(
		commitsRangeCmd.stdout,
	).trim();

	error = textDecoder.decode(
		commitsRangeCmd.stderr,
	);

	if (error) throw error;

	const commitStart = commitsRange.split(',')[0];
	const commitStop = commitsRange.split(',')[1];

	logger.debug(`commitsRange: "${commitsRange}"`);

	// Get next semantic version
	let nextSemanticVersion = latestReleaseTag;

	if (commitStart !== commitStop) {
		const nextSemanticVersionCmd = new Deno.Command(getNextSemanticVersion, {
			args: [latestReleaseTag, commitStart, commitStop],
		})
			.outputSync();
		nextSemanticVersion = textDecoder.decode(
			nextSemanticVersionCmd.stdout,
		).trim();

		error = textDecoder.decode(
			nextSemanticVersionCmd.stderr,
		);

		if (error) throw error;
	}

	logger.debug(`nextSemanticVersion: "${nextSemanticVersion}"`);

	Deno.writeTextFileSync(versionFile, nextSemanticVersion);
};

export const generateVersion = async (versionFile: string, versionTsFile: string) => {
	generateVersionFile(versionFile);
	await cliVersionTsFile(versionFile, versionTsFile);
};
