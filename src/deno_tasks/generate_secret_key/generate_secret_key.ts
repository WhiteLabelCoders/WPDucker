// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { getRandomId } from '../../utils/get_random_id/get_random_id.ts';

const generateSecretKeyFile = async (secretKeyFile: string) => {
	if (await pathExist(secretKeyFile)) {
		console.log('Secret key file already exist!', secretKeyFile);
		return;
	}

	console.log('Write secret key to file', secretKeyFile);
	await Deno.writeTextFile(
		secretKeyFile,
		getRandomId(15, '1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM'),
	);
};

const generateSecretKeyTsFile = async (secretKeyFile: string, secretKeyTsFile: string) => {
	if (!await pathExist(secretKeyFile)) {
		throw `Secret key file doesn't exist! ${secretKeyFile}`;
	}

	const fileContent = `export const secretKey = "${
		Deno.readTextFileSync(secretKeyFile).trim()
	}";`;

	console.log('Write secret key to typescript file', secretKeyTsFile);
	Deno.writeTextFile(secretKeyTsFile, fileContent);
};

export const generateSecretKey = async (secretKeyFile: string, secretKeyTsFile: string) => {
	await generateSecretKeyFile(secretKeyFile);
	await generateSecretKeyTsFile(secretKeyFile, secretKeyTsFile);
};
