import { CLI_PVFB } from '../../constants/CLI_PVFB.ts';
import createProjectStructure from '../../utils/create_project_structure/create_project_structure.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { classCliVersionManager } from './cli_version_manager.ts';
import { classDatabase } from '../database/database.ts';
import { classGitHubApiClient } from '../github/gh_api_client.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { isBoolean, isObject } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { pathExist } from '../../utils/path_exist/path_exist.ts';

Deno.test('classCliVersionManager', async function testClassCliVersionManager() {
	const testDir = `${cwd()}/test_classCliVersionManager`;
	const testData = {
		dir: {
			test: `${testDir}`,
			project: `${testDir}/project`,
			cli: {
				main: `${testDir}/.cli`,
				tmp: `${testDir}/.cli/tmp`,
				versions: `${testDir}/.cli/versions`,
				localStorage: `${testDir}/.cli/localStorage`,
			},
		},
	};

	await createProjectStructure(`${testData.dir.project}`);

	const database = new classDatabase({ dirname: testData.dir.test });

	await database.init('testName');

	const gitHubApiClient = new classGitHubApiClient({
		github: {
			owner: 'WhiteLabelCoders',
			repo: 'WPDucker',
			apiUrl: 'https://api.github.com',
		},
		database,
	});

	const cliVersionManager = new classCliVersionManager({
		cliDir: testData.dir.cli,
		gitHubApiClient,
		tmpDir: testData.dir.cli.tmp,
	});

	const latestVer = (await cliVersionManager.getVersionsList()).at(-1)?.tagName;

	if (!latestVer) {
		throw 'Undefined latest version of cli!';
	}

	cliVersionManager.setPrefferdCliVersion(latestVer);
	await cliVersionManager.init();

	const _cwd = cwd();

	Deno.chdir(testData.dir.project);

	cliVersionManager.setPrefferdCliVersion(latestVer);
	await cliVersionManager.init();
	cliVersionManager.unsetPrefferdCliVersion();

	Deno.writeTextFileSync(`${testData.dir.project}/${CLI_PVFB}`, `999.999.999`);

	assert(
		(await getError<string>(async () => {
			await cliVersionManager.init();
		})).length > 0,
		'try to get unavailable version',
	);

	assert(
		cliVersionManager.getDispatchTarget().map((p) => p.includes(testData.dir.cli.versions))
			.includes(true),
		'get dispatch path',
	);

	assert(
		(await getError<string>(async () => {
			await cliVersionManager.downloadVersion(`0.0.1`);
		})) === undefined,
		'download version',
	);

	assert(await pathExist(`${testData.dir.cli.versions}/0.0.1/wpd`), 'verify download');

	assert(await cliVersionManager.ensureVersion('0.0.1') === undefined, 'ensure version');

	const useLatest = await getError<string>(async () => {
		await cliVersionManager.useLatest();
	});

	assert(
		useLatest === undefined,
		`use latest version = "${useLatest}"`,
	);

	assert(Array.isArray(await cliVersionManager.getVersionsList()), 'versions list');

	assert(isObject(cliVersionManager.getDirInfo()), 'get dir info');

	assert(isBoolean(cliVersionManager.shouldOutsourceCmd()), 'should outsource cmd');

	Deno.chdir(_cwd);

	await database.deleteAll();

	await Deno.remove(testDir, { recursive: true });
});
