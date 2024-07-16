// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import * as emoji from 'https://deno.land/x/emoji@0.3.0/mod.ts';
import { logger } from '../../global/logger.ts';

export function emojify(text: string) {
	logger.debugFn(arguments);

	const emojifedText = emoji.emojify(text);
	logger.debugVar('emojifedText', emojifedText);

	return emojifedText;
}
