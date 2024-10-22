// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

/**
 * Check if a path exists.
 *
 * @param path - The path to check.
 *
 * @returns True if the path exists.
 */
export const pathExist = async (path: string) => {
	try {
		await Deno.stat(path);

		return true;
	} catch {
		return false;
	}
};

/**
 * The function `pathExistSync` checks if a file or directory exists at the specified path
 * synchronously.
 * @param {string} path - The `path` parameter in the `pathExistSync` function is a string that
 * represents the file or directory path that you want to check for existence synchronously.
 * @returns The `pathExistSync` function returns `true` if the path exists and `false` if it does not
 * exist.
 */
export const pathExistSync = (path: string) => {
	try {
		Deno.statSync(path);

		return true;
	} catch {
		return false;
	}
};
