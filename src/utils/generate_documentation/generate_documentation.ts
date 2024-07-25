// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { isArray } from 'https://cdn.skypack.dev/lodash-es@4.17.21';
import { ansiColors } from '../../classes/logger/colors.ts';

const getLongestItem = (arr: string[]) => {
	if (arr.length === 0) {
		return '';
	}

	let longestItem = arr[0];
	for (let i = 1; i < arr.length; i++) {
		if (arr[i].length > longestItem.length) {
			longestItem = arr[i];
		}
	}

	return longestItem;
};

export const generateDocumentation = (
	args: {
		usage: string;
		description: string;
		commands: string[][];
		arguments: string[][];
		options: (string | string[])[][];
		colorTheme: {
			heading: string;
			key: string;
			description: string;
		};
	},
) => {
	const requiredCommandLength = getLongestItem(args.commands.map((el) => el?.[0] || '')).length;
	const requiredArgumentsLength =
		getLongestItem(args.arguments.map((el) => el?.[0] || '')).length;
	const requiredOptionLength = getLongestItem(args.options.map((el) => {
		const elArray = isArray(el?.[0]) ? el?.[0] : [el?.[0] || ''];
		return elArray.join(', ');
	})).length;
	const usage =
		`${args.colorTheme.heading}Usage: ${ansiColors.Reset}${args.colorTheme.key}${args.usage}${ansiColors.Reset}`;
	const description =
		`${args.colorTheme.heading}Description:${ansiColors.Reset} ${args.colorTheme.description}${args.description}${ansiColors.Reset}`;
	const commands = `${args.colorTheme.heading}Commands:${ansiColors.Reset}\n${
		args.commands.map((cmd) => {
			const cmdString = cmd?.[0] || '';
			const fillSpaceLength = requiredCommandLength - cmdString.length;
			const fillSpace = new Array(fillSpaceLength || 0).fill(' ').join(
				'',
			);
			return `  ${args.colorTheme.key}${cmdString}${fillSpace}${ansiColors.Reset}  ${args.colorTheme.description}${
				cmd?.[1] || ''
			}${ansiColors.Reset}`;
		}).join('\n')
	}`;
	const _arguments = `${args.colorTheme.heading}Arguments:${ansiColors.Reset}\n${
		args.arguments.map((arg) => {
			const argString = arg?.[0] || '';
			const fillSpaceLength = requiredArgumentsLength - argString.length;
			const fillSpace = new Array(fillSpaceLength || 0).fill(' ').join(
				'',
			);
			return `  ${args.colorTheme.key}${argString}${fillSpace}${ansiColors.Reset}  ${args.colorTheme.description}${
				arg?.[1] || ''
			}${ansiColors.Reset}`;
		}).join('\n')
	}`;
	const options = `${args.colorTheme.heading}Options:${ansiColors.Reset}\n${
		args.options.map((opt) => {
			const optArray = isArray(opt?.[0]) ? opt?.[0] : [opt?.[0] || ''];
			const optString = optArray.map((optStr) =>
				`${args.colorTheme.key}${optStr}${ansiColors.Reset}`
			).join(', ');
			const fillSpaceLength = requiredOptionLength -
				optArray.join(', ').length;
			const fillSpace = new Array(fillSpaceLength || 0).fill(
				' ',
			).join('');

			return `  ${args.colorTheme.key}${optString}${fillSpace}${ansiColors.Reset}  ${args.colorTheme.description}${
				opt?.[1] || ''
			}${ansiColors.Reset}`;
		}).join('\n')
	}`;

	return `${args.usage.length > 0 ? usage : ''}${
		args.description.length > 0 ? `\n\n${description}` : ''
	}${args.commands.length > 0 ? `\n\n${commands}` : ''}${
		args.arguments.length > 0 ? `\n\n${_arguments}` : ''
	}${args.options.length > 0 ? `\n\n${options}` : ''}\n`;
};
