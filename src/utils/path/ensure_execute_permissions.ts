import { logger } from '../../global/logger.ts';

/**
 * The function `ensureWpdPermissions` checks if a file at a given path is executable and upgrades
 * its permissions if necessary.
 * @param {string} path - The `path` parameter is a string that represents the file path of the file
 * for which we want to ensure executable permissions.
 */
export const ensureExecutePermissions = (path: string) => {
	const dispatchTargetMode = Deno.statSync(path).mode;
	const executePermission = 0o111;

	if (dispatchTargetMode !== null && !(dispatchTargetMode & executePermission)) {
		logger.debug(
			`"${path}" is not executable! Upgrading permissions.`,
		);

		Deno.chmodSync(path, dispatchTargetMode | executePermission);
	}
};
