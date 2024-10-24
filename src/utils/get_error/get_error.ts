// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';

/**
 * The `getError` function is a TypeScript async function that executes a callback and returns any
 * error that occurs during its execution.
 * @param callback - A function that returns a promise. This function will be executed and any errors
 * thrown within it will be caught and returned as the result of the promise.
 * @returns The function `getError` returns a promise that resolves to the error object caught in the
 * `catch` block, or `undefined` if no error was thrown.
 */
export async function getError<T>(callback: () => Promise<any> | any): Promise<T> {
	logger.debugFn(arguments);

	let _throw = undefined;

	try {
		await callback();
	} catch (error) {
		_throw = error;
	}

	logger.debugVar('_throw', _throw);

	return _throw as T;
}
