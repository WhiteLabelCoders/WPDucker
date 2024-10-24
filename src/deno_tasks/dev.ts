// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { _ } from '../utils/lodash/lodash.ts';
import { pathExistSync } from '../utils/path_exist/path_exist.ts';

const watcher = Deno.watchFs(['src']);

const delay = 50;

const runTestFile = async (filename: string) => {
	const preCmd = new Deno.Command(Deno.execPath(), {
		args: ['task', 'pre:compile'],
	});

	const cmd = new Deno.Command(Deno.execPath(), {
		args: ['test', ...Deno.args, filename, '--', '--debug'],
	});

	preCmd.outputSync();

	const process = cmd.spawn();

	await process.status;
};

const runDefinitionFile = async (filename: string) => {
	const preCmd = new Deno.Command(Deno.execPath(), {
		args: ['task', 'pre:compile'],
	});

	const cmd = new Deno.Command(Deno.execPath(), {
		args: ['run', ...Deno.args, filename, '--', '--debug'],
	});

	preCmd.outputSync();

	const process = cmd.spawn();

	await process.status;
};

const dispatchEvent = _.debounce(async (event: Deno.FsEvent) => {
	for (const path of event.paths) {
		const pathSegments = path.split('/');
		const dirname = pathSegments.slice(0, pathSegments.length - 1).join('/');
		const basename = pathSegments.slice(-1)[0];

		if (dirname.includes('src/pre_compiled')) {
			continue;
		}

		const testFile = `${dirname}/${basename.split('.').at(0)}.test.ts`;
		const definitionFile = `${dirname}/${basename.split('.').at(0)}.ts`;

		if (pathExistSync(testFile)) {
			console.clear();
			console.error(`Run test file!`, testFile);
			await runTestFile(testFile);
		} else {
			console.clear();
			console.error(`Test file doesn't exist!`, testFile);
			console.error(`Run definition file!`, definitionFile);
			await runDefinitionFile(definitionFile);
		}
	}
}, delay);

for await (const event of watcher) {
	await dispatchEvent(event);
}
