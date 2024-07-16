// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { classLogger } from './logger.ts';
import { assertGreater } from 'https://deno.land/std@0.201.0/assert/assert_greater.ts';
import { ansiColors } from './colors.ts';
import { noError } from '../../utils/no_error/no_error.ts';
import { assert } from 'https://deno.land/std@0.162.0/_util/assert.ts';
import { isArray } from 'https://cdn.skypack.dev/lodash-es@4.17.21';

Deno.test('classLogger', async function testClassLogger() {
	const logger = new classLogger();
	const logsData = [{
		message: 'log',
		logType: 'log',
	}, {
		message: 'debug',
		logType: 'debug',
	}, {
		message: 'Var \\"myVar\\":, my custom value',
		args: ['myVar', 'my custom value'],
		logType: 'debugVar',
	}, {
		message: 'Arguments:, ["arg1","arg2"]',
		args: [['arg1', 'arg2']],
		logType: 'debugFn',
	}, {
		message: 'info',
		logType: 'info',
	}, {
		message: 'error',
		logType: 'error',
	}, {
		message: 'success',
		logType: 'success',
	}];

	logsData.forEach((log) => {
		// deno-lint-ignore no-explicit-any
		const args = log?.args || log.message;
		(logger as any)[log.logType](...(isArray(args) ? args : [args]));
	});

	logger.omitStorage(true);
	logger.log('omited');
	logger.omitStorage(false);

	const logsLength = logger.getLength();
	const logsWeight = logger.getWeight('b');
	const logsWeightKb = logger.getWeight('kb');
	const logsWeightMb = logger.getWeight('mb');
	const logs = logger.getAllLogs();
	const lastLog = logger.getLastLog();

	assertEquals(logsLength, logsData.length, 'logs length');
	assertGreater(logsWeight, 0, 'logs weight');
	assertEquals(logsWeightKb, logsWeight / 1024, 'logs weight kb');
	assertEquals(logsWeightMb, logsWeight / 1024 / 1024, 'logs weight mb');
	assertEquals(
		logs,
		logsData.map((ld) => ({ message: ld.message, logType: ld.logType })),
		'logs storage',
	);
	assertEquals(lastLog, logsData[logsData.length - 1], 'last log');

	const logger1 = new classLogger({ omitStorage: false, maxWeight: 0 });

	assertEquals(logger1['getMessageColor'](''), ansiColors.Reset, 'default color');

	logger1.log('max weight is default!');

	assert(
		await noError(() => {
			logger1.displayDebug(true);
		}),
		'display debug',
	);

	assert(
		await noError(() => {
			logger1.displayDate(true);
		}),
		'display date',
	);

	logger1.info('info message!', { my_test: 'v1' });

	const maxWeight = 1024 * 1024 * 2;
	const logger2 = new classLogger({ omitStorage: false, maxWeight });
	const testMessage = new Array(1000).fill('test message.').join(' ');
	const testLog = () => logger2.debug(testMessage);

	logger2.displayDebug(false);

	testLog();

	const weight = logger2.getWeight();

	const loopsToForceOptimization = Math.ceil(maxWeight / weight);

	logger1.info('start test for memory optimization');

	for (let i = 0; i < loopsToForceOptimization; i++) {
		testLog();
	}

	assert(maxWeight >= logger2.getWeight(), 'max weight');
});
