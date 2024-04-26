import { ansiColors } from './colors.ts';
import { getCallingFunctionName } from '../../utils/calling_function_name/calling_function_name.ts';
import { formatDate } from '../../utils/format_date/format_date.ts';
import { isString } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { secretKey } from '../../pre_compiled/__secret_key.ts';
import { generateCrptoKey } from '../../utils/generate_crypto_key/generate_crypto_key.ts';

/* The `classLogger` class is a TypeScript class that provides logging functionality with configurable
options. */
export class classLogger {
	public config = {
		omitStorage: false,
		maxWeight: 1024 * 1024 * 100,
		displayDebug: true,
		displayDate: true,
	};
	public archive: ReturnType<typeof this.getLogLine>[] = [];

	/**
	 * The constructor function initializes a Logger instance with optional configuration parameters.
	 * @param [config] - The `config` parameter is an optional object that can contain the following
	 * properties:
	 * omitStorage?: boolean;
	 * maxWeight?: number;
	 * displayDebug?: boolean;
	 * displayDate?: boolean;
	 */
	constructor(config?: {
		omitStorage?: boolean;
		maxWeight?: number;
		displayDebug?: boolean;
		displayDate?: boolean;
	}) {
		this.config.omitStorage = typeof config?.omitStorage == 'boolean'
			? config?.omitStorage
			: false;
		this.config.maxWeight = config?.maxWeight && config?.maxWeight >= 1024 * 1024 * 1
			? config?.maxWeight
			: 1024 * 1024 * 1;
		this.config.displayDebug = typeof config?.displayDebug == 'boolean'
			? config?.displayDebug
			: true;
		this.config.displayDate = typeof config?.displayDate == 'boolean'
			? config?.displayDate
			: true;

		this.omitStorage(true);
		this.debug('New Logger instance was created.');
		this.omitStorage(false);
	}

	/**
	 * The function `getMessageColor` returns the ANSI color code based on the given log type.
	 * @param {string} logType - The `logType` parameter is a string that represents the type of log
	 * message. It can have one of the following values: 'log', 'debug', 'error', 'info', or 'success'.
	 * @returns The color code corresponding to the given log type.
	 */
	public getMessageColor(logType: string) {
		switch (logType) {
			case 'log':
				return ansiColors.Reset;

			case 'debug':
			case 'debugVar':
			case 'debugFn':
				return ansiColors.FgMagenta;

			case 'error':
				return ansiColors.FgRed;

			case 'info':
				return ansiColors.FgCyan;

			case 'success':
				return ansiColors.FgGreen;

			default:
				return ansiColors.Reset;
		}
	}

	/**
	 * The function "keepLogsOptimized" checks if the weight of the logger exceeds the maximum weight, and
	 * if so, shifts logs, omits storage, and recursively calls itself.
	 */
	public keepLogsOptimized() {
		if (this.getWeight() > this.config.maxWeight) {
			this.archive.shift();
			this.keepLogsOptimized();
		}
	}

	/**
	 * The function returns an object with a log type and message.
	 * @param {string} logType - The logType parameter is a string that represents the type of log
	 * message. It could be something like "info", "warning", "error", etc.
	 * @param {string} message - A string representing the log message.
	 * @returns An object with the properties "message" and "logType".
	 */
	public getLogLine(logType: string, data: any[]) {
		const message = data.map((v) => {
			let value = JSON.stringify(v);

			if (!isString(value)) {
				return value;
			}

			if (value.startsWith('"')) {
				value = value.slice(1);
			}

			if (value.endsWith('"')) {
				value = value.slice(0, -1);
			}

			return value;
		}).join(', ');

		return {
			message,
			logType,
		};
	}

	/**
	 * The primaryLogFunction is a public function in TypeScript that logs a message with a specified log
	 * type and performs additional formatting and handling based on the configuration settings.
	 * @param {string} message - The `message` parameter is a string that represents the log message that
	 * you want to log.
	 * @param {string} logType - The `logType` parameter is a string that represents the type of log
	 * message being passed to the `primaryLogFunction`. It is used to determine the color and formatting
	 * of the log message.
	 */
	public primaryLogFunction(
		data: any[],
		logType: string,
		callback: (...data: any[]) => void,
	) {
		data = this.hashSecrets(data);

		const logLine = this.getLogLine(logType, data);

		!this.config.omitStorage && this.archive.push(logLine);

		this.keepLogsOptimized();

		const now = new Date();
		const date = formatDate(now);
		const MessageColor = this.getMessageColor(logType);
		const dateColor = MessageColor;
		const resetColor = ansiColors.Reset;
		const debug = ['debug', 'debugVar', 'debugFn'].includes(logType);
		const extraDebugMsg = debug ? ` ${getCallingFunctionName()}(...):` : '';
		const extraDebugMsgColor = ansiColors.Dim;

		data = this.truncateLogData(data);

		const coloredText = [
			`${
				this.config.displayDate
					? `${dateColor}[${date}]${resetColor}`
					: ''
			}${MessageColor}[${logType}]:${resetColor}${extraDebugMsgColor}${extraDebugMsg}${resetColor}`,
			...data,
		];

		const omitDebug = debug && !this.config.displayDebug;

		if (omitDebug) {
			return;
		}

		!omitDebug && callback(...coloredText);
	}

	public truncateLogData(data: any[]) {
		return data.map((d) => {
			if (isString(d)) {
				d = d.length <= 200 ? d : `${d.slice(0, 197)}...`;
			}

			return d;
		});
	}

	public hashSecrets(data: any[]) {
		const secrets = this.getSecrets();

		return data.map((d) => {
			const stringifed: string = isString(d) ? d : JSON.stringify(d);

			if (!this.stringContainsSecret(stringifed)) {
				return d;
			}

			let hashed = stringifed;

			for (let i = 0; i < secrets.length; i++) {
				const secret = secrets[i];
				hashed = hashed.replaceAll(secret, new Array(secret.length).fill('*').join(''));
			}

			if (isString(d)) {
				return hashed;
			}

			try {
				const parsed = JSON.parse(hashed);

				return parsed;
			} catch {
				return hashed;
			}
		});
	}

	public getSecrets() {
		return [
			secretKey,
			generateCrptoKey(secretKey),
		];
	}

	public stringContainsSecret(x: string) {
		const secrets = this.getSecrets();

		for (let i = 0; i < secrets.length; i++) {
			const secret = secrets[i];

			if (!x?.includes(secret)) {
				continue;
			}

			return true;
		}

		return false;
	}

	/**
	 * The function `omitStorage` sets the `omitStorage` property of the `config` object to the value of
	 * the `bool` parameter.
	 * @param {boolean} bool - A boolean value that determines whether or not to omit storage.
	 */
	public omitStorage(bool: boolean) {
		this.config.omitStorage = bool;
	}

	/**
	 * The function sets the displayDebug property of the config object to the value of the boolean
	 * parameter.
	 * @param {boolean} bool - The "bool" parameter is a boolean type, which means it can only have two
	 * possible values: true or false.
	 */
	public displayDebug(bool: boolean) {
		this.config.displayDebug = bool;
	}

	/**
	 * The function sets the displayDate property of a configuration object to a boolean value.
	 * @param {boolean} bool - The "bool" parameter is a boolean value that determines whether or not to
	 * display the date. If the value is true, the date will be displayed. If the value is false, the date
	 * will not be displayed.
	 */
	public displayDate(bool: boolean) {
		this.config.displayDate = bool;
	}

	/**
	 * The log function logs a message using the primaryLogFunction with the log level set to 'log'.
	 * @param {string} message - The parameter "message" is of type string. It is used to pass a message
	 * that will be logged.
	 */
	public log(...data: any[]) {
		this.primaryLogFunction(data, 'log', console.log);
	}

	/**
	 * The info function logs an informational message.
	 * @param {string} message - The parameter "message" is of type string. It is used to pass a message
	 * that will be logged as an information message.
	 */
	public info(...data: any[]) {
		this.primaryLogFunction(data, 'info', console.log);
	}

	/**
	 * The debug function logs a message with the 'debug' level.
	 * @param {string} message - The parameter "message" is of type string. It is used to pass a debug
	 * message that needs to be logged or displayed for debugging purposes.
	 */
	public debug(...data: any[]) {
		this.primaryLogFunction(data, 'debug', console.debug);
	}

	/**
	 * The `debugVar` function in TypeScript logs the variable name and its data to the console using
	 * `console.debug`.
	 * @param {string} name - The `name` parameter in the `debugVar` function is a string that represents
	 * the name of the variable or data being debugged.
	 * @param {any[]} data - The `data` parameter in the `debugVar` function is a rest parameter,
	 * indicated by the use of the spread operator `...`. This means that it can accept an arbitrary
	 * number of arguments as an array. In this case, it allows you to pass multiple values of any type as
	 * arguments when
	 */
	public debugVar(name: string, ...data: any[]) {
		this.primaryLogFunction([`Var "${name}":`, ...data], 'debugVar', console.debug);
	}

	/**
	 * The `debugFn` function calls the `primaryLogFunction` method with an empty array, 'debug', and
	 * `console.debug` as arguments.
	 */
	public debugFn(args: IArguments = [] as unknown as IArguments) {
		this.primaryLogFunction(
			args.length > 0 ? ['Arguments:', [...args]] : [],
			'debugFn',
			console.debug,
		);
	}

	/**
	 * The function logs a success message using a primary log function.
	 * @param {string} message - The parameter "message" is a string that represents the success message
	 * that you want to log.
	 */
	public success(...data: any[]) {
		this.primaryLogFunction(data, 'success', console.log);
	}

	/**
	 * The function logs an error message using a primary log function.
	 * @param {string} message - The parameter "message" is of type string and represents the error
	 * message that you want to log.
	 */
	public error(...data: any[]) {
		this.primaryLogFunction(data, 'error', console.error);
	}

	/**
	 * The function returns a copy of all the logs in the archive.
	 * @returns An array containing all the logs in the archive.
	 */
	public getAllLogs() {
		return [...this.archive];
	}

	/**
	 * The function returns the last log entry from an archive.
	 * @returns The last log in the archive.
	 */
	public getLastLog() {
		return this.archive[this.archive.length - 1];
	}

	/**
	 * The function calculates the weight of a JSON object in bytes, kilobytes, or megabytes.
	 * @param {'b' | 'kb' | 'mb'} [unit] - The `unit` parameter is an optional parameter that specifies
	 * the unit in which the weight should be returned. It can have one of three values: 'b' for bytes,
	 * 'kb' for kilobytes, or 'mb' for megabytes. If the `unit` parameter is not provided
	 * @returns The weight of the archive in the specified unit (bytes, kilobytes, or megabytes) is being
	 * returned.
	 */
	public getWeight(unit?: 'b' | 'kb' | 'mb') {
		const jsonString = JSON.stringify(this.archive);
		const encoder = new TextEncoder();
		const bytes = encoder.encode(jsonString).length;

		if (unit == 'b') {
			return bytes;
		} else if (unit == 'kb') {
			return bytes / 1024;
		} else if (unit == 'mb') {
			return bytes / 1024 / 1024;
		}

		return bytes;
	}

	/**
	 * The function returns the length of the "archive" array.
	 * @returns The length of the archive.
	 */
	public getLength() {
		return this.archive.length;
	}
}
