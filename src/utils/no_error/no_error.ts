import { logger } from '../../global/logger.ts';

/**
 * The `noError` function is a TypeScript function that wraps a callback function and handles any
 * errors that occur within it.
 * @param callback - The `callback` parameter is a function that returns a `Promise<void>` or `void`.
 * It is the function that will be executed inside the `try` block of the `noError` function.
 * @returns The function `noError` returns a promise that resolves to a boolean value. It returns
 * `true` if the `callback` function is executed without throwing an error, and `false` if an error is
 * caught and logged.
 */
export const noError = async (callback: () => Promise<void> | void) => {
	try {
		await callback();
	} catch (error) {
		logger.debug(`Error:`, error);
		return false;
	}

	return true;
};
