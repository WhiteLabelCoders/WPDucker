// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classDatabase } from '../../classes/database/database.ts';
import { classGitHubApiClient } from '../../classes/github/gh_api_client.ts';
import { IRelease, IReleases } from '../../classes/github/releases_list.d.ts';
import { logger } from '../../global/logger.ts';
import { releasesMockup } from './releases.ts';

export function getGhApiClientForTests(db: classDatabase) {
    const client = new classGitHubApiClient({ database: db });
    client.fetchReleases = async function () {
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

        const releases: IRelease[] = releasesMockup;
        logger.debugVar('releases', releases);

        await this.addCache(cacheId, releases);

        return releases;
    };

    return client;
}
