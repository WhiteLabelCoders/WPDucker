/**
 * The function `pathExist` checks if a given path exists.
 * @param {string} path - The `path` parameter is a string that represents the file or directory path
 * that you want to check for existence.
 * @returns The function `pathExist` returns a boolean value. It returns `true` if the path exists and
 * `false` if the path does not exist.
 */
export const pathExist = async (path: string) => {
	try {
		await Deno.stat(path);

		return true;
	} catch {
		return false;
	}
};
