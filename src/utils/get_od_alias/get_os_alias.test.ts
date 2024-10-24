// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from '@std/assert';
import { getOsAlias } from './get_os_alias.ts';

Deno.test('getOsAlias', () => {
	assertEquals(getOsAlias('aix', 'aarch64'), 'Os not recognized', 'test not recognized os');
	assertEquals(getOsAlias('linux', 'x86_64'), 'linux_x64', 'test linux_x64');
	assertEquals(getOsAlias('darwin', 'x86_64'), 'macos_x64', 'test macos_x64');
	assertEquals(getOsAlias('darwin', 'aarch64'), 'macos_arm', 'test macos_arm');
	assertEquals(getOsAlias().length > 1, true, 'test no value');
});
