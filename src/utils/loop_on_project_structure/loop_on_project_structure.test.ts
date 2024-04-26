import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { loopOnProjectStructure } from './loop_on_project_structure.ts';
import { CLI_PROJECT_STRUCTURE } from '../../constants/CLI_PROJECT_STRUCTURE.ts';
import { CLI_PROJECT_STRUCTURE_EMPTY_DIR } from '../../constants/CLI_PROJECT_STRUCTURE_EMPTY_DIR.ts';

Deno.test('loopOnProjectStructure', function testLoopOnProjectStructure() {
	const testStructure = Object.assign(CLI_PROJECT_STRUCTURE, {
		testDir: { emptyTestDir: CLI_PROJECT_STRUCTURE_EMPTY_DIR, testFile: 'test content' },
	});

	const customKeys = ['testDir', 'emptyTestDir', 'testFile'];
	const customPathsIncludes = ['testDir', 'testDir/emptyTestDir', 'testFile', 'testDir/testFile'];
	const customValue = [['testFile', 'test content']];
	const pass = {
		keys: [] as string[],
		paths: [] as string[],
		values: [] as [string, string][],
	};

	loopOnProjectStructure(testStructure, ({ path, value, key }) => {
		customKeys.forEach((ckey) => {
			if (key != ckey) {
				return;
			}

			pass.keys.push(ckey);
		});

		customPathsIncludes.forEach((cpath) => {
			if (!path.includes(cpath) || pass.paths.includes(cpath)) {
				return;
			}

			pass.paths.push(cpath);
		});

		customValue.forEach((cvalue) => {
			if (cvalue[1] !== value || cvalue[0] !== key) {
				return;
			}

			pass.values.push([cvalue[0], cvalue[1]]);
		});
	});

	assertEquals(pass, { keys: customKeys, paths: customPathsIncludes, values: customValue });
});
