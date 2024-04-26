import { TCommandArgs } from './command.d.ts';
import { logger } from '../../global/logger.ts';
import { getCurrentCliVersion } from '../../utils/get_current_cli_version/get_current_cli_version.ts';
import { emojify } from '../../utils/emojify/emojify.ts';
import { isUndefined, random } from 'https://cdn.skypack.dev/lodash-es@4.17.21';

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

	public getPhrase() {
		logger.debugFn(arguments);

		const phrase = this.args.commandPhrase;
		logger.debugVar('phrase', phrase);

		return phrase;
	}

	public getDocs() {
		logger.debugFn(arguments);

		const documentation = this.documentation;
		logger.debugVar('documentation', documentation);

		return documentation;
	}

	public getDocumentationMessage() {
		logger.debugFn(arguments);

		const message = `${this.getIntroForDocumentation()}\n${this.getDocs() || '<empty>'}`;
		logger.debugVar('message', message);

		return message;
	}

	public displayDocumentation() {
		logger.debugFn(arguments);

		logger.info(this.getDocumentationMessage());
	}

	public getCliBrandEmoji() {
		return emojify(':duck:');
	}

	public getIntroForDocumentation() {
		logger.debugFn(arguments);

		let intro = `${this.getRandomMessageFrom(this.geDocumentationPhrases())}\n`;
		intro += '					 \n';
		intro += `WPDucker version ${getCurrentCliVersion()}\n\n`;
		intro += `Documentation:\n`;
		logger.debugVar('intro', intro);

		return intro;
	}

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

	public getRandomMessageFrom(feed: string[]) {
		logger.debugFn(arguments);

		const randomMessage = `${this.getCliBrandEmoji()} ${feed[random(0, feed.length - 1)]}`;
		logger.debugVar('randomMessage', randomMessage);

		return randomMessage;
	}

	public displayRandomStartPhrase() {
		logger.debugFn(arguments);

		logger.info(this.getRandomMessageFrom(this.getStartPhrases()));
	}

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

	public displayRandomEndPhrase() {
		logger.debugFn(arguments);
		logger.success(this.getRandomMessageFrom(this.getEndPhrases()));
	}

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

	public userNeedDocs() {
		logger.debugFn(arguments);

		const userNeedDocs = this.args.hasBoolean(['h', 'help'], 'OR');
		logger.debugVar('userNeedDocs', userNeedDocs);

		return userNeedDocs;
	}

	public getOrAskForArg(
		name: string,
		askMessage: string,
		required: boolean = false,
		defaultValue = '',
	) {
		logger.debugFn(arguments);

		const value = this.args.getKV([name])?.[0]?.[1];
		logger.debugVar('value', value);

		if (!isUndefined(value)) {
			return value;
		}

		return this.askForArg(askMessage, required, defaultValue);
	}

	public askForArg(message: string, required: boolean = false, defaultValue: string) {
		logger.debugFn(arguments);

		const _prompt = () =>
			prompt(
				`${this.getCliBrandEmoji()} ${required == true ? `(Required) ` : ''}${
					!!defaultValue == true ? `(Default: "${defaultValue}") ` : ''
				}${message}`,
			) || defaultValue;

		if (required == false) {
			const promptValue = _prompt();
			logger.debugVar('promptValue', promptValue);

			return promptValue;
		}

		let userAnswer = '';
		logger.debugVar('userAnswer', userAnswer);
		while (!userAnswer) {
			userAnswer = _prompt() || '';
			logger.debugVar('userAnswer', userAnswer);
		}

		return userAnswer;
	}

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

	abstract exec(): Promise<void> | void;
}
