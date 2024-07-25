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
