// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { classGitHubApiClient } from './gh_api_client.ts';
import { getDbForTests } from '../../utils/get_db_for_tests/get_db_for_tests.ts';

Deno.test('classGitHubApiClient', async function testClassGitHubApiClient() {
	const { database, server } = await getDbForTests();

	const ghApi = new classGitHubApiClient({ database });

	const releases = await ghApi.fetchReleases();
	const releaseTagName = releases[0].tag_name;
	const release = await ghApi.fetchReleaseByTagName(releaseTagName);

	assertEquals(Array.isArray(releases), true, 'ghApi.fetchReleases() return array');
	assertEquals(releaseTagName.length > 0, true, 'release tag name');
	assertEquals(
		typeof release,
		'object',
		'ghApi.fetchReleaseByTagName(releaseTagName) return object',
	);

	await database.destroySession();
	await server.stop();
});
