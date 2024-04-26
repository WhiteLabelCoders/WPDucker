import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { getCurrentCliVersion } from './get_current_cli_version.ts';

Deno.test('getCurrentCliVersion', async function testGetCurrentCliVersion() {
	assertEquals(typeof await getCurrentCliVersion() === 'string', true, 'version');
});
