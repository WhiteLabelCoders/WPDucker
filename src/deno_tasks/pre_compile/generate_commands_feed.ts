// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { recursiveReaddir } from 'https://deno.land/x/recursive_readdir@v2.0.0/mod.ts';
import { extname } from '@std/path/extname';
import { pathExist } from '../../utils/path_exist/path_exist.ts';

export const generateEmptyCommandsMetaFeedFile = async (commandsMetaFile: string) => {
	logger.debug('Generate empty commands meta file', commandsMetaFile);

	await Deno.writeTextFile(commandsMetaFile, 'export const COMMANDS_META_FEED = [];\n');
};

const generateCommandsMetaFeedFile = async (commandsRootDir: string, commandsMetaFile: string) => {
	const data: { import: string; metaName: string; docs: string }[] = [];
	for (
		const file of (await recursiveReaddir(commandsRootDir)).filter(
			(file: string) =>
				extname(file) === '.ts' && !file.endsWith('.test.ts') && !file.endsWith('.d.ts') &&
				!file.endsWith('.docs.ts') && !file.endsWith('index.ts'),
		)
	) {
		logger.debug(`Var file:`, file);

		const importResult = (await import(file))?.default;

		logger.debug(`Var importResult:`, importResult);

		logger.debug(importResult.class.name);

		const commandImportName = `${importResult.class.name}Meta`;
		const importPhrase = `import ${commandImportName} from '${file}';`;
		const docsFile = `${file.slice(0, -3)}.docs.txt`;
		const docsFileContent = await pathExist(docsFile) ? Deno.readTextFileSync(docsFile) : '';
		const docs = importResult?.documentation || docsFileContent;

		data.push({
			import: importPhrase,
			metaName: commandImportName,
			docs: docs,
		});
	}

	logger.debug(`Var data:`, data);
	const spacing = '    ';

	const moduleContent = `${
		data.map((item) => item.import).join('\n')
	}\n\nexport const COMMANDS_META_FEED = [\n${spacing}${
		data.map((item) => {
			const result = `[${item.metaName}.phrase, ${item.metaName}.description]`;
			return result;
		}).join(`,\n${spacing}`)
	},\n];\n`;

	logger.debug(`Var moduleContent:\n`, moduleContent);

	logger.debug(`Write commands meta to file`, commandsMetaFile);

	await Deno.writeTextFile(commandsMetaFile, moduleContent);
};

export const generateCommandsMetaFeed = async (
	commandsRootDir: string,
	commandsMetaFile: string,
) => {
	await generateCommandsMetaFeedFile(commandsRootDir, commandsMetaFile);
};
