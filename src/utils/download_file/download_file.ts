// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { pathExist } from '../path_exist/path_exist.ts';
import { logger } from '../../global/logger.ts';

/**
 * The `downloadFile` function is a TypeScript function that downloads a file from a given URL, saves
 * it to a specified directory, and optionally returns the file content.
 * @param arg - The `arg` parameter is an object that contains the following properties:
 * @returns The function `downloadFile` returns an object with the following properties:
 */
export async function downloadFile(
	arg: { url: string; saveToFile: boolean; destDir: string; returnFileContent: boolean },
) {
	logger.debugFn(arguments);

	const { url, destDir, saveToFile, returnFileContent } = arg;
	const req = await fetch(url);
	logger.debugVar('req', req);

	if (!req.ok) {
		await req.body?.cancel();
		throw `Something went wrong while request to "${url}". Error code: ${req.status}`;
	}

	const contentDisposition = req.headers.get('content-disposition');
	logger.debugVar('contentDisposition', contentDisposition);

	let filename = 'unknown';
	logger.debugVar('filename', filename);

	if (contentDisposition) {
		const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);

		if (match && match[1]) {
			filename = match[1].replace(/['"]/g, '');
			logger.debugVar('filename', filename);
		}
	} else {
		const candidate = new URL(url).pathname.split('/').slice(-1)[0];
		logger.debugVar('candidate', candidate);

		if (candidate) {
			filename = candidate;
			logger.debugVar('filename', filename);
		}
	}

	const contentLength = Number(req.headers.get('content-length'));
	logger.debugVar('contentLength', contentLength);

	const fileContent = new Uint8Array(contentLength);
	logger.debugVar('fileContent', fileContent.length);

	let downloadedBytes = 0;
	logger.debugVar('downloadedBytes', downloadedBytes);

	const classProgressBar = await import('https://deno.land/x/progress@v1.3.9/mod.ts');
	logger.debugVar('classProgressBar', classProgressBar);

	const progressBar = new classProgressBar.default({
		total: 100,
		interval: 15,
		width: 10,
		display: 'Downloading: :percent :bar t: :time eta: :eta',
	});
	logger.debugVar('progressBar', progressBar);

	progressBar.render(0);

	if (!req.body) {
		throw `Invalid response body of request to "${url}"`;
	}

	for await (const chunk of req.body) {
		fileContent.set(chunk, downloadedBytes);

		downloadedBytes += chunk.length;
		logger.debugVar('downloadedBytes', downloadedBytes);

		const progress = Math.floor((downloadedBytes / contentLength) * 100);
		logger.debugVar('progress', progress);

		progressBar.render(progress);
	}

	progressBar.end();

	const details: {
		basename: string;
		filename?: string;
		fileContent?: Uint8Array;
	} = {
		basename: filename,
	};
	logger.debugVar('details', { ...details, fileContent: `Uint8Array (${contentLength})` });

	if (saveToFile) {
		if (!await pathExist(destDir)) {
			logger.debug('Make directory', destDir);
			await Deno.mkdir(destDir, { recursive: true });
		}

		const filepath = `${destDir}/${filename}`;
		logger.debugVar('filepath', filepath);

		details.filename = filepath;
		logger.debugVar('details.filename', details.filename);

		if (await pathExist(filepath)) {
			logger.debug('Remove', filepath);
			await Deno.remove(filepath);
		}

		logger.debug('Write file', filepath, `Uint8Array (${contentLength})`);
		await Deno.writeFile(filepath, fileContent);
	}

	if (returnFileContent) {
		details.fileContent = fileContent;
		logger.debugVar('details.fileContent', `Uint8Array (${contentLength})`);
	}

	logger.debugVar('details', { ...details, fileContent: `Uint8Array (${contentLength})` });
	return details;
}
