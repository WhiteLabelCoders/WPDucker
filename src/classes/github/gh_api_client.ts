// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { GH_API_CLIENT_CREDENTIALS } from '../../constants/GH_API_CLIENT_CREDENTIALS.ts';
import { logger } from '../../global/logger.ts';
import { classDatabase } from '../database/database.ts';
import { type IRelease, IReleases } from './releases_list.d.ts';

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
		args: { github?: { owner: string; repo: string; apiUrl: string }; database: classDatabase },
	) {
		logger.debugFn(arguments);

		const _github = args.github || GH_API_CLIENT_CREDENTIALS;
		logger.debugVar('_github', _github);

		this.github = _github;
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
	public getCacheObject(data: any, expiration: number) {
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
	public async addCache(id: string, data: any, expiration?: number) {
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

		if (Date.now() > (cache?.value?.expiration || 0)) {
			await this.database.removePersistentKey(id);
			return undefined;
		}

		const value = cache?.value?.data;
		logger.debugVar('value', value);

		return value;
	}

	/**
	 * This TypeScript function fetches a list of releases from a GitHub repository, caches the response,
	 * and returns the releases.
	 * @returns The `fetchReleases` function returns an array of release objects (`IRelease[]`).
	 */
	public async fetchReleases() {
		logger.debugFn(arguments);

		const cacheId = `ListOfReleases`;
		logger.debugVar('cacheId', cacheId);

		const cache = await this.getCache(cacheId);
		logger.debugVar('cache', cache);

		if (cache) {
			const cachedResponse = cache as IReleases[];
			logger.debugVar('cachedResponse', cachedResponse);

			return cachedResponse;
		}

		const releases: IRelease[] = [];
		logger.debugVar('releases', releases);

		let page = 1;
		logger.debugVar('page', page);

		const perPage = 100;
		logger.debugVar('perPage', perPage);

		while (true) {
			const url =
				`${this.github.apiUrl}/repos/${this.github.owner}/${this.github.repo}/releases?per_page=${perPage}&page=${page}`;
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

			const jsonResponse: IReleases[] = await req.json();
			logger.debugVar('jsonResponse', jsonResponse);

			jsonResponse.forEach((release) => {
				const fitRelease = {
					tag_name: release.tag_name,
					published_at: release.published_at,
					assets: release.assets.map((asset) => {
						return {
							name: asset.name,
							browser_download_url: asset.browser_download_url,
						};
					}),
				};
				logger.debugVar('fitRelease', fitRelease);

				releases.push(fitRelease);
				logger.debugVar('releases', releases);
			});

			if (jsonResponse.length < perPage) {
				break;
			}

			page++;
			logger.debugVar('page', page);
		}

		await this.addCache(cacheId, releases);

		return releases;
	}

	/**
	 * This function fetches a release by its tag name asynchronously.
	 * @param {string} tagName - The `fetchReleaseByTagName` function is designed to fetch a release by
	 * its tag name. The `tagName` parameter is a string that represents the tag name of the release you
	 * want to retrieve.
	 * @returns The `fetchReleaseByTagName` function is returning the release object that matches the
	 * provided `tagName` from the list of releases fetched by the `fetchReleases` function.
	 */
	public async fetchReleaseByTagName(tagName: string) {
		logger.debugFn(arguments);

		const release = (await this.fetchReleases()).find((predicate) =>
			predicate.tag_name === tagName
		);
		logger.debugVar('release', release);

		return release;
	}
}
