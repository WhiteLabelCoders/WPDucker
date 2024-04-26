import { logger } from '../../global/logger.ts';
import { classDatabase } from '../database/database.ts';
import { IReleaseByTagName } from './release_by_tag_name.d.ts';
import { IReleases } from './releases_list.d.ts';

/* The `classGitHubApiClient` is a TypeScript class that provides methods for fetching releases from a
GitHub repository, caching the responses, and retrieving cached data. */
export class classGitHubApiClient {
	public github;
	public database;

	/**
	 * The constructor function initializes the GitHub API client with the provided owner, repo, and
	 * apiUrl.
	 * @param args - An object containing the following properties:
	 */
	constructor(
		args: { github: { owner: string; repo: string; apiUrl: string }; database: classDatabase },
	) {
		logger.debugFn(arguments);

		this.github = args.github;
		logger.debugVar('this.github', this.github);

		this.database = args.database;
		logger.debugVar('this.database', this.database);
	}

	/**
	 * The function returns an object containing data and expiration time for caching purposes.
	 * @param {string} data - The `data` parameter is a string that represents the data that you want to
	 * database in the cache object.
	 * @param {number} expiration - The expiration parameter is a number that represents the duration in
	 * milliseconds for which the cache object should be considered valid. After this duration has passed,
	 * the cache object should be considered expired and should not be used.
	 * @returns An object with properties "data" and "expiration" is being returned.
	 */
	public getCacheObject(data: string, expiration: number) {
		logger.debugFn(arguments);

		const cacheObj = {
			data,
			expiration,
		};
		logger.debugVar('cacheObj', cacheObj);

		return cacheObj;
	}

	/**
	 * The addCache function adds a value to the cache with an optional expiration time.
	 * @param {string} id - The `id` parameter is a string that represents the unique identifier for the
	 * cache entry. It is used to database and retrieve the cache data.
	 * @param {string} data - The `data` parameter is a string that represents the value to be databased in
	 * the cache.
	 * @param {number} [expiration] - The `expiration` parameter is an optional parameter that specifies
	 * the expiration time for the cache entry. It is a number representing the number of milliseconds
	 * since the Unix epoch. If not provided, the default expiration time is set to 5 minutes (1000
	 * milliseconds * 60 seconds * 5 minutes).
	 */
	public async addCache(id: string, data: string, expiration?: number) {
		logger.debugFn(arguments);

		const _expiration = Date.now() + (1000 * 60 * 5);
		logger.debugVar('_expiration', _expiration);

		const value = this.getCacheObject(data, expiration || _expiration);
		logger.debugVar('value', value);

		await this.database.setPersistentValue(id, value);
	}

	/**
	 * The function `getCache` retrieves a cached value from a database and checks if it has expired.
	 * @param {string} id - The `id` parameter is a string that represents the unique identifier for the
	 * cache. It is used to retrieve the cache object from the this.database.
	 * @returns the `data` property of the `cache` object.
	 */
	public async getCache(id: string) {
		logger.debugFn(arguments);

		const cache = await this.database.getPersistentValue<
			ReturnType<typeof this.getCacheObject>
		>(
			id,
		);
		logger.debugVar('cache', cache);

		if (Date.now() > (cache?.expiration || 0)) {
			await this.database.removePersistentKey(id);
			return undefined;
		}

		const value = cache.data;
		logger.debugVar('value', value);

		return value;
	}

	/**
	 * The function fetches releases from a GitHub repository, checks if the response is cached, and
	 * returns the releases either from the cache or by making a request to the GitHub API.
	 * @returns a Promise that resolves to an array of IReleases objects.
	 */
	public async fetchReleases() {
		logger.debugFn(arguments);

		const cacheId = `${this.github.owner}-${this.github.repo}-fetchReleases`;
		logger.debugVar('cacheId', cacheId);

		const cache = await this.getCache(cacheId);
		logger.debugVar('cache', cache);

		if (cache) {
			const cachedResponse = JSON.parse(cache) as IReleases[];
			logger.debugVar('cachedResponse', cachedResponse);

			return cachedResponse;
		}

		const url =
			`${this.github.apiUrl}/repos/${this.github.owner}/${this.github.repo}/releases?per_page=20&page=1`;
		logger.debugVar('url', url);

		const headers = {};
		logger.debugVar('headers', headers);

		const req = await fetch(url, {
			method: 'GET',
			headers,
		});
		logger.debugVar('req', req);

		if (req.status.toString().slice(0, 1) != '2') {
			const message = (await req.json())?.message || req;
			logger.debugVar('message', message);

			throw message;
		}

		const jsonResponse: Promise<IReleases[]> = req.json();
		logger.debugVar('jsonResponse', jsonResponse);

		await this.addCache(cacheId, JSON.stringify(await jsonResponse));

		return jsonResponse;
	}

	/**
	 * The function fetches a release from a GitHub repository based on a given tag name, and caches the
	 * response for future use.
	 * @param {string} tagName - The `tagName` parameter is a string that represents the name of the tag
	 * for which you want to fetch the release.
	 * @returns a Promise that resolves to an object of type IReleaseByTagName.
	 */
	public async fetchReleaseByTagName(tagName: string) {
		logger.debugFn(arguments);

		const cacheId = `${this.github.owner}-${this.github.repo}-fetchReleaseByTagName-${tagName}`;
		logger.debugVar('cacheId', cacheId);

		const cache = await this.getCache(cacheId);
		logger.debugVar('cache', cache);

		if (cache) {
			const cachedResponse = JSON.parse(cache) as IReleaseByTagName;
			logger.debugVar('cachedResponse', cachedResponse);

			return cachedResponse;
		}

		const url =
			`${this.github.apiUrl}/repos/${this.github.owner}/${this.github.repo}/releases/tags/${tagName}`;
		logger.debugVar('url', url);

		const headers = {};
		logger.debugVar('headers', headers);

		const req = await fetch(url, {
			method: 'GET',
			headers,
		});
		logger.debugVar('req', req);

		if (req.status == 404) {
			await req.body?.cancel();
			throw `Not found wpd release by tag name "${tagName}"!`;
		}

		const jsonResponse: Promise<IReleaseByTagName> = req.json();
		logger.debugVar('jsonResponse', jsonResponse);

		await this.addCache(cacheId, JSON.stringify(await jsonResponse));

		return jsonResponse;
	}
}
