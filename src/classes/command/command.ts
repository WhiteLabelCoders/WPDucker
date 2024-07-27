// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { TCommandArgs } from './command.d.ts';
import { logger } from '../../global/logger.ts';
import { getCurrentCliVersion } from '../../utils/get_current_cli_version/get_current_cli_version.ts';
import { emojify } from '../../utils/emojify/emojify.ts';
import { lodash, lodash as _ } from 'https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts';
import { pwd } from '../../utils/pwd/pwd.ts';

export abstract class classCommand {
	public args;
	public documentation;
	public stopExecution = false;

	constructor(args: TCommandArgs) {
		logger.debugFn(arguments);

		this.args = args.commandArgs;
		logger.debugVar('this.args', this.args);

		this.documentation = args.documentation;
		logger.debugVar('this.documentation', this.documentation);
	}

	/**
	 * This function retrieves and returns the command phrase stored in the 'args' object.
	 * @returns The `phrase` variable is being returned.
	 */
	public getPhrase() {
		logger.debugFn(arguments);

		const phrase = this.args.commandPhrase;
		logger.debugVar('phrase', phrase);

		return phrase;
	}

	/**
	 * This function retrieves and returns the documentation stored in the class instance.
	 * @returns The `documentation` variable is being returned from the `getDocs` function.
	 */
	public getDocs() {
		logger.debugFn(arguments);

		const documentation = this.documentation;
		logger.debugVar('documentation', documentation);

		return documentation;
	}

	/**
	 * This function retrieves a documentation message by combining an introduction and documentation
	 * content, with a fallback to '<empty>' if no documentation is available.
	 * @returns The `getDocumentationMessage` function returns a message that includes the result of
	 * calling `getIntroForDocumentation` and `getDocs` methods, separated by a newline character. If
	 * `getDocs` returns a falsy value (such as `null` or `undefined`), the message will include
	 * `'<empty>'` as a placeholder.
	 */
	public getDocumentationMessage() {
		logger.debugFn(arguments);

		const message = `${this.getIntroForDocumentation()}\n${this.getDocs() || '<empty>'}`;
		logger.debugVar('message', message);

		return message;
	}

	/**
	 * The `displayDocumentation` function logs debug information and displays a documentation message.
	 */
	public displayDocumentation() {
		logger.debugFn(arguments);

		logger.info(this.getDocumentationMessage());
	}

	/**
	 * The function `getCliBrandEmoji` returns a duck emoji.
	 * @returns The `:duck:` emoji is being returned.
	 */
	public getCliBrandEmoji() {
		return emojify(':duck:');
	}

	/**
	 * This TypeScript function generates an introduction for documentation, including a random message,
	 * the current version of WPDucker, and a reference to the documentation.
	 * @returns The `getIntroForDocumentation` function returns an introductory message for documentation.
	 * The message includes a random phrase from a list of documentation phrases, the current version of
	 * WPDucker, and a header indicating "Documentation:".
	 */
	public getIntroForDocumentation() {
		logger.debugFn(arguments);

		let intro = `${this.getRandomMessageFrom(this.geDocumentationPhrases())}\n`;
		intro += '					 \n';
		intro += `WPDucker version ${getCurrentCliVersion()}\n\n`;
		intro += `Documentation:\n`;
		logger.debugVar('intro', intro);

		return intro;
	}

	/**
	 * The function `getStartPhrases` returns an array of phrases that can be used to start a process or
	 * task.
	 * @returns An array of phrases that can be used to start a process or task.
	 */
	public getStartPhrases() {
		logger.debugFn(arguments);

		const phrases = [
			"Alright, let's begin.",
			"Okay, let's kick things off.",
			"Sure, let's get started.",
			"Alrighty, let's dive in.",
			"Okay, let's commence.",
			"Sure thing, let's initiate.",
			"Alright, let's launch into it.",
			"Okay, let's embark on this journey.",
			"Sure, let's fire up the engines.",
			"Alright, let's initiate the process.",
			"Okay, let's roll up our sleeves and start.",
			"Sure, let's set things in motion.",
			"Alright, let's open the door to progress.",
			"Okay, let's inaugurate this endeavor.",
			"Sure, let's take the first step forward.",
			"Alright, let's inaugurate the proceedings.",
			"Okay, let's break the ice and begin.",
			"Sure, let's kickstart our efforts.",
			"Alright, let's ignite the spark of action.",
			"Okay, let's lay the groundwork and commence.",
		];
		logger.debugVar('phrases', phrases);

		return phrases;
	}

	/**
	 * The function getRandomMessageFrom takes an array of strings as input and returns a random message
	 * from that array with a brand emoji added to it.
	 * @param {string[]} feed - The `feed` parameter is an array of strings containing messages or items
	 * from which a random message will be selected.
	 * @returns The `getRandomMessageFrom` function returns a random message from the `feed` array,
	 * prefixed with the result of the `getCliBrandEmoji` function.
	 */
	public getRandomMessageFrom(feed: string[]) {
		logger.debugFn(arguments);

		const randomMessage = `${this.getCliBrandEmoji()} ${feed[_.random(0, feed.length - 1)]}`;
		logger.debugVar('randomMessage', randomMessage);

		return randomMessage;
	}

	/**
	 * The function `displayRandomStartPhrase` logs a random message from a list of start phrases.
	 */
	public displayRandomStartPhrase() {
		logger.debugFn(arguments);

		logger.info(this.getRandomMessageFrom(this.getStartPhrases()));
	}

	/**
	 * This function returns an array of phrases that can be used to introduce or present documentation.
	 * @returns An array of phrases that can be used to introduce or present documentation.
	 */
	public geDocumentationPhrases() {
		logger.debugFn(arguments);

		const phrases = [
			"Here's my documentation:",
			'Presenting my documentation:',
			'Behold, my documentation:',
			'Witness my documentation:',
			'Take a look at my documentation:',
			'Herein lies my documentation:',
			'Offering up my documentation:',
			'Revealing my documentation:',
			'Unveiling my documentation:',
			'Sharing my documentation:',
			'Displaying my documentation:',
			'Introducing my documentation:',
			'Providing my documentation:',
			'Exposing my documentation:',
			'Handing over my documentation:',
			'Putting forth my documentation:',
			'Delving into my documentation:',
			'Granting access to my documentation:',
			'Disclosing my documentation:',
			'Offering my documentation for review:',
		];
		logger.debugVar('phrases', phrases);

		return phrases;
	}

	/**
	 * The function `getEndPhrases` returns an array of phrases indicating successful completion of a task
	 * or project.
	 * @returns An array of phrases indicating the completion of a task or project.
	 */
	public getEndPhrases() {
		logger.debugFn(arguments);

		const phrases = [
			'Task completed.',
			'Mission accomplished.',
			'Work finished.',
			'Assignment fulfilled.',
			'Objective achieved.',
			'Project concluded.',
			'Duty discharged.',
			'Job finalized.',
			'Goal attained.',
			'Work completed successfully.',
			'Task achieved.',
			'Mission fulfilled.',
			'Work done.',
			'Assignment completed.',
			'Objective reached.',
			'Project done.',
			'Duty completed.',
			'Job finished.',
			'Goal accomplished.',
			'Work wrapped up.',
		];
		logger.debugVar('phrases', phrases);

		return phrases;
	}

	/**
	 * This function logs a random end phrase from a list of end phrases.
	 */
	public displayRandomEndPhrase() {
		logger.debugFn(arguments);
		logger.success(this.getRandomMessageFrom(this.getEndPhrases()));
	}

	/**
	 * The `preExec` function checks if user needs documentation and displays it, setting `stopExecution`
	 * to true if needed, otherwise displays a random start phrase.
	 */
	public preExec() {
		logger.debugFn(arguments);

		if (this.userNeedDocs()) {
			this.displayDocumentation();
			this.stopExecution = true;
			logger.debugVar('this.stopExecution', this.stopExecution);
		} else {
			this.displayRandomStartPhrase();
		}
	}

	/**
	 * This function checks if the user needs documentation based on the presence of certain command line
	 * arguments.
	 * @returns The function `userNeedDocs()` is returning the value of the variable `userNeedDocs`, which
	 * is determined by checking if the arguments contain either 'h' or 'help' as boolean values.
	 */
	public userNeedDocs() {
		logger.debugFn(arguments);

		const userNeedDocs = this.args.hasBoolean(['h', 'help'], 'OR');
		logger.debugVar('userNeedDocs', userNeedDocs);

		return userNeedDocs;
	}

	/**
	 * Retrieves the value of an argument or prompts the user to provide it.
	 *
	 * @param args - The configuration options for retrieving or prompting the argument.
	 * @param args.name - The name of the argument.
	 * @param args.askMessage - The message to display when prompting the user for the argument value.
	 * @param args.required - (Optional) Specifies whether the argument is required. Defaults to `false`.
	 * @param args.throwIfInvalid - (Optional) Specifies whether to throw an error if the argument value is invalid. Defaults to `false`.
	 * @param args.defaultValue - (Optional) The default value to use if the argument is not provided.
	 * @param args.validator - (Optional) A function that validates the argument value. Should return `true` if the value is valid, a string error message if the value is invalid, or a promise that resolves to either of these.
	 *
	 * @returns The value of the argument.
	 *
	 * @throws If the argument is required and not provided, or if `throwIfInvalid` is `true` and the argument value is invalid.
	 */
	public async getOrAskForArg(args: {
		name: string;
		askMessage: string;
		required?: boolean;
		throwIfInvalid?: boolean;
		defaultValue?: string;
		validator?: (value: string) => true | string | Promise<true | string>;
	}) {
		logger.debugFn(arguments);
		const {
			name,
			askMessage: message,
			required = false,
			throwIfInvalid = false,
			defaultValue = '',
			validator,
		} = args;

		const value = this.args.getKV([name])?.[0]?.[1];
		logger.debugVar('value', value);
		const validation = validator ? await validator(value) : undefined;
		logger.debugVar('validation', validation);

		// If the value is provided and valid, return the value
		if (!_.isUndefined(value) && !_.isString(validation)) {
			return value;
		}

		// IF throwIfInvalid is true and provided validator is a function, throw an error
		if (throwIfInvalid && lodash.isFunction(validator)) {
			throw lodash.isString(validation)
				? validation
				: `Invalid value of argument "${name}" !`;
		}

		logger.error(
			lodash.isString(validation) ? validation : `Invalid value of argument "${name}" !`,
		);

		return await this.askForArg({ message, required, defaultValue, validator });
	}

	/**
	 * The function `askForArg` prompts the user for input based on specified arguments, including
	 * message, required flag, default value, and optional validation function.
	 * @param args - The `askForArg` function takes in an object `args` with the following properties:
	 * @returns The `askForArg` function returns the user's answer after validating it based on the
	 * provided arguments. If the answer is required and passes validation, it will return the user's
	 * input. If the answer is not required and passes validation, it will return the user's input. If the
	 * answer is required but fails validation, it will keep prompting the user until a valid input is
	 * provided.
	 */
	public async askForArg(args: {
		message: string;
		required: boolean;
		defaultValue: string;
		validator?: (value: string) => true | string | Promise<true | string>;
	}) {
		logger.debugFn(arguments);

		const { message, required = false, defaultValue, validator } = args;

		const _prompt = () =>
			prompt(
				`${this.getCliBrandEmoji()} ${required == true ? `(Required) ` : ''}${
					!!defaultValue == true ? `(Default: "${defaultValue}") ` : ''
				}${message}`,
			) || defaultValue;

		let userAnswer = _prompt();
		logger.debugVar('userAnswer', userAnswer);

		let validation = validator ? await validator(userAnswer) : undefined;
		logger.debugVar('validation', validation);

		if (required == false && !_.isString(validation)) {
			return userAnswer;
		}

		while (!userAnswer || _.isString(validation)) {
			userAnswer = _prompt() || '';
			logger.debugVar('userAnswer', userAnswer);

			validation = validator ? await validator(userAnswer) : undefined;
			logger.debugVar('validation', validation);

			logger.error(validation);
		}

		return userAnswer;
	}

	/**
	 * The function `onlyInsideProject` checks if the current working directory is within the scope of the
	 * WPD project and logs an error message if not.
	 * @returns If the condition `_pwd` is falsy, the function will return without executing any further
	 * code.
	 */
	public async onlyInsideProject() {
		logger.debugFn(arguments);

		const _pwd = await pwd();
		logger.debugVar('_pwd', _pwd);

		if (!_pwd) {
			throw `Operation cancelled! The command "${this.getPhrase()}" can only be executed within the scope of the WPD project.`;
		}
	}

	/**
	 * This TypeScript function retrieves the current working directory path asynchronously and throws an
	 * error if it is incorrect.
	 * @returns The `getPwd` function is returning the current working directory path.
	 */
	public async getPwd() {
		logger.debugFn(arguments);

		const currentPwd = await pwd();
		logger.debugVar('currentPwd', currentPwd);

		if (!currentPwd) {
			throw `Incorrect project workdir "${currentPwd}"!`;
		}

		return currentPwd;
	}

	/**
	 * The function `validateEnvName` checks if the provided environment name contains only alphanumeric
	 * characters, hyphens, and underscores.
	 * @param {string} envName - The `envName` parameter is a string that represents the name of an
	 * environment. The `validateEnvName` function is used to check if the `envName` follows a specific
	 * pattern defined by the regular expression `^[A-Za-z0-9-_]+$`. This pattern allows only alphanumeric
	 * characters
	 */
	public validateEnvName(envName: string) {
		logger.debugFn(arguments);

		const ENV_NAME_REGEX = /^[A-Za-z0-9-_]+$/;
		logger.debugVar('ENV_NAME_REGEX', ENV_NAME_REGEX);

		if (!ENV_NAME_REGEX.test(envName)) {
			return `Invalid environment name "${envName}". Only A-z 0-9 - _ are allowed!`;
		}

		return true;
	}

	/**
	 * The _exec function logs arguments, performs pre-execution tasks, checks for stopExecution flag,
	 * executes the main logic asynchronously, and displays a random end phrase.
	 * @returns If the `stopExecution` condition is met, a random end phrase will be displayed and the
	 * function will return without executing the `exec()` function. If the `stopExecution` condition is
	 * not met, the `exec()` function will be awaited and executed, followed by displaying a random end
	 * phrase.
	 */
	public async _exec() {
		logger.debugFn(arguments);

		this.preExec();

		if (this.stopExecution) {
			this.displayRandomEndPhrase();
			return;
		}

		await this.exec();
		this.displayRandomEndPhrase();
	}

	/* The above code is defining an abstract method `exec()` in a TypeScript class. This method is
	expected to return a `Promise<void>` or `void`. Subclasses that extend this class must implement
	the `exec()` method. */
	abstract exec(): Promise<void> | void;
}
