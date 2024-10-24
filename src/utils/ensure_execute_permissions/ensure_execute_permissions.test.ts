// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from '@std/assert';
import { noError } from '../no_error/no_error.ts';
import { cwd } from '../cwd/cwd.ts';
import { ensureExecutePermissions } from './ensure_execute_permissions.ts';

Deno.test('ensureExecutePermissions', async function testEnsureExecutePermissions() {
	const testDir = `${cwd()}/test_ensureExecutePermissions`;
	const testFilename = `${testDir}/f1`;

	Deno.mkdirSync(testDir, { recursive: true });
	Deno.writeTextFileSync(`${testDir}/f1`, '');

	assert(
		await noError(() => {
			ensureExecutePermissions(testFilename);
		}),
		'ensure exec permissions',
	);

	const executePermission = 0o111;
	const mode = Deno.statSync(testFilename).mode;

	assert(mode !== null && (mode & executePermission), 'check mode');

	Deno.removeSync(testDir, { recursive: true });
});
