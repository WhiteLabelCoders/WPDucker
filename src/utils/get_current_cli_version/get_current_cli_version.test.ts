// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { getCurrentCliVersion } from './get_current_cli_version.ts';

Deno.test('getCurrentCliVersion', async function testGetCurrentCliVersion() {
	assertEquals(typeof await getCurrentCliVersion() === 'string', true, 'version');
});
