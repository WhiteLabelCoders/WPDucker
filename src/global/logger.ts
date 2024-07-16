// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classLogger } from '../classes/logger/logger.ts';

/* The code is creating a new instance of the `classLogger` class and assigning it to the `logger`
constant. The `classLogger` constructor takes an object as an argument with two properties:
`displayDebug` and `displayDate`. */
export const logger = new classLogger({
	displayDebug: Deno.args.includes('--debug'),
	displayDate: Deno.args.includes('--debug'),
});
