import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { getError } from '../../utils/get_error/get_error.ts';
import classDependencyChecker from './dependency_checker.ts';

Deno.test('classDependencyChecker', async function testClassDependencyChecker() {
	assert(
		['undefined', 'string'].includes(
			typeof (await getError(() =>
				classDependencyChecker.check([{
					cmd: 'command',
					args: ['-v', 'unavailableCommand'],
				}])
			)),
		),
		'check() failed',
	);
});
