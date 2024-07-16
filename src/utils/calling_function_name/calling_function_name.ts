// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

/**
 * The function `getCallingFunctionName` retrieves the name of the calling function in TypeScript.
 * @param [offset=4] - The `offset` parameter is used to determine the position in the call stack to
 * retrieve the calling function name. By default, it is set to 4, which means it will retrieve the
 * calling function name that is 4 levels above the `getCallingFunctionName` function in the call
 * stack.
 * @param [unknown=false] - The `unknown` parameter is a boolean flag that determines whether to return
 * "Unknown" if the calling function name cannot be determined. If `unknown` is set to `true`, the
 * function will always return "Unknown" regardless of whether the calling function name can be
 * determined or not.
 * @returns The function `getCallingFunctionName` returns the name of the calling function. If the
 * stack trace is not available or the `unknown` parameter is set to `true`, it returns the string
 * "Unknown".
 */
export const getCallingFunctionName = (offset = 4, unknown = false) => {
	const stack = new Error().stack;
	const Unknown = 'Unknown';

	if (!stack || unknown) {
		return Unknown;
	}

	const stackLines = stack.split('\n');
	const callerLine = stackLines[offset].trim();
	const callerFunctionName = callerLine.substring(
		callerLine.indexOf(' ') + 1,
		callerLine.lastIndexOf(' ('),
	);

	if (!callerFunctionName.length || callerFunctionName === 'at ') {
		return Unknown;
	}

	return callerFunctionName;
};
