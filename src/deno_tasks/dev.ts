import { lodash as _ } from 'https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts';

const watcher = Deno.watchFs(['src']);

const delay = 50;

const pathExist = (path: string) => {
	try {
		Deno.statSync(path);

		return true;
	} catch {
		return false;
	}
};

const dispatchEvent = _.debounce((event: Deno.FsEvent) => {
	for (const path of event.paths) {
		const pathSegments = path.split('/');
		const dirname = pathSegments.slice(0, pathSegments.length - 1).join('/');
		const basename = pathSegments.slice(-1)[0];

		if (dirname.includes('src/pre_compiled')) {
			continue;
		}

		const runFilename = `${dirname}/${basename.split('.').at(0)}.test.ts`;

		if (!pathExist(runFilename)) {
			console.clear();
			console.error(`File doesn't exist!`, runFilename);
			continue;
		}

		const preCmd = new Deno.Command(Deno.execPath(), {
			args: ['task', 'pre:compile'],
		});

		const cmd = new Deno.Command(Deno.execPath(), {
			args: ['test', ...Deno.args, runFilename, '--', '--debug'],
		});

		console.clear();

		preCmd.outputSync();
		cmd.spawn();
	}
}, delay);

for await (const event of watcher) {
	dispatchEvent(event);
}
