import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { generateUniqueBasename } from '../generate_unique_basename/generate_unique_basename.ts';
import { cwd } from '../cwd/cwd.ts';
import { getCliVersionRequiredByProject } from './get_cli_version_required_by_project.ts';
import { logger } from '../../global/logger.ts';
import { loopOnProjectStructure } from '../loop_on_project_structure/loop_on_project_structure.ts';
import createProjectStructure from '../create_project_structure/create_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { CLI_PVFB } from '../../constants/CLI_PVFB.ts';

Deno.test('getCliVersionRequiredByProject', async function testGetCliVersionRequiredByProject() {
	const baseCwd = cwd();
	const testDirBasename = await generateUniqueBasename({
		basePath: cwd(),
		prefix: 'test_',
	});
	const testDir = `${cwd()}/${testDirBasename}`;

	await Deno.mkdir(testDir, { recursive: true });

	Deno.chdir(testDir);

	assertEquals(await getCliVersionRequiredByProject(), false, 'no project version');

	const testVersion = '99.99.99';

	logger.debug('Create project structure.');
	await createProjectStructure(testDir);

	logger.debug('Loop project structure.');
	loopOnProjectStructure(CLI_PROJECT_STRUCTURE, ({ key }) => {
		if (key !== CLI_PVFB) {
			return;
		}

		Deno.writeTextFileSync(CLI_PVFB, testVersion);
	}, testDir);

	assertEquals(await getCliVersionRequiredByProject(), testVersion, 'project version');

	Deno.chdir(baseCwd);

	await Deno.remove(testDir, { recursive: true });
});
