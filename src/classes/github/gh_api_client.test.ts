import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { classGitHubApiClient } from './gh_api_client.ts';
import { cwd } from '../../utils/cwd/cwd.ts';
import { classDatabase } from '../database/database.ts';

Deno.test('classGitHubApiClient', async function testClassGitHubApiClient() {
	const testDir = `${cwd()}/test_classGitHubApiClient`;
	const testData = {
		dir: {
			test: `${testDir}`,
		},
	};

	const database = new classDatabase({ dirname: testData.dir.test });

	await database.init('testName');

	const ghApi = new classGitHubApiClient({
		github: {
			owner: 'WhiteLabelCoders',
			repo: 'WPDucker',
			apiUrl: 'https://api.github.com',
		},
		database,
	});

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

	await Deno.remove(testDir, { recursive: true });
});
