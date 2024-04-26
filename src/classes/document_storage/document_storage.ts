import { logger } from '../../global/logger.ts';
import { generateUniqueBasename } from '../../utils/generate_unique_basename/generate_unique_basename.ts';
import { pathExist } from '../../utils/path_exist/path_exist.ts';
import { classCrypto } from '../crypto/crypto.ts';

/* The `classDocumentStorage` is a TypeScript class that provides methods for creating, managing, and
manipulating a document storage system. */
export class classDocumentStorage {
	public dirname;
	public basename = 'wpd_encrypted_ds.txt';
	public basenameLocked = 'wpd_encrypted_ds.lock.txt';
	public sessionId = '';
	public destroyed = true;

	/**
	 * The constructor function initializes the value of the "dirname" property.
	 * @param {string} dirname - A string representing the name of the directory.
	 */
	constructor(dirname: string) {
		logger.debugFn(arguments);

		this.dirname = dirname;
		logger.debugVar('this.dirname', this.dirname);
	}

	/**
	 * The `init` function initializes the object by checking if a document exists, creating one if it
	 * doesn't, and then registering the client.
	 */
	public async init() {
		logger.debugFn(arguments);

		this.destroyed = false;
		logger.debugVar('this.destroyed', this.destroyed);

		if (!await this.documentExist()) {
			await this.createDocument();
		}

		await this.registerClient();
	}

	/**
	 * The function "destroySession" destroys the current session by unregistering the client, resetting
	 * the session ID, and setting the "destroyed" flag to true.
	 */
	public async destroySession() {
		logger.debugFn(arguments);

		await this.unregisterClient();

		this.sessionId = '';
		logger.debugVar('this.sessionId', this.sessionId);

		this.destroyed = true;
		logger.debugVar('this.destroyed', this.destroyed);
	}

	/**
	 * The function prevents accessing a destroyed document storage session and throws an error if the
	 * session is not initialized.
	 */
	public preventDestroyedSession() {
		logger.debugFn(arguments);

		if (this.destroyed) {
			throw 'Document storage session is destroyed! First initialize session!';
		}
	}

	/**
	 * The function creates a new document by removing any existing document with the same name, creating
	 * the necessary directory if it doesn't exist, and then writing an empty text file.
	 * @returns The `createDocument()` function is returning a promise that resolves to the result of
	 * `Deno.writeTextFile(documentDetails.filename, '')`.
	 */
	public async createDocument() {
		logger.debugFn(arguments);

		const documentDetails = this.getDocumentDetails();
		logger.debugVar('documentDetails', documentDetails);

		if (await this.documentExist()) {
			logger.debug('Remove', documentDetails.filename);
			await Deno.remove(documentDetails.filename);
		}

		if (!await pathExist(documentDetails.dirname)) {
			logger.debug('Make directory', documentDetails.dirname);
			await Deno.mkdir(documentDetails.dirname, { recursive: true });
		}

		logger.debug('Write text file', documentDetails.filename, '');
		await Deno.writeTextFile(documentDetails.filename, '');
	}

	/**
	 * The function checks if a document exists by retrieving its filename and using the pathExist
	 * function.
	 * @returns the result of the `pathExist(filename)` function call.
	 */
	public async documentExist() {
		logger.debugFn(arguments);

		const filename = this.getDocumentDetails().filename;
		logger.debugVar('filename', filename);

		const exist = await pathExist(filename);
		logger.debugVar('exist', exist);

		return exist;
	}

	/**
	 * The function returns an object containing various details about a document, such as the directory
	 * name, base name, locked base name, and file name.
	 * @returns an object with the following properties:
	 */
	public getDocumentDetails() {
		logger.debugFn(arguments);

		const details = {
			dirname: this.dirname,
			basename: this.basename,
			basenameLocked: this.basenameLocked,
			filename: `${this.dirname}/${this.basename}`,
			filenameLocked: `${this.dirname}/${this.basenameLocked}`,
		};
		logger.debugVar('details', details);

		return details;
	}

	/**
	 * The function encodes data into a JSON string format.
	 * @param {T} data - The `data` parameter is a generic type `T` which represents any type of data that
	 * can be passed to the `encodeData` function.
	 * @returns the JSON string representation of the input data.
	 */
	public encodeData<T>(data: T) {
		logger.debugFn();

		if (data == '') {
			return '';
		}

		return classCrypto.encode(JSON.stringify(data));
	}

	/**
	 * The function decodes a string of data into a JavaScript object using JSON parsing.
	 * @param {string} data - The `data` parameter is a string that represents encoded data.
	 * @returns the decoded data as an object with string keys and any values.
	 */
	public decodeData(data: string) {
		logger.debugFn();

		if (data == '') {
			return '';
		}

		// deno-lint-ignore no-explicit-any
		return JSON.parse(classCrypto.decode(data)) as { [key: string]: any };
	}

	/**
	 * The function `registerClient` generates a unique basename for a client and creates a directory for
	 * the client using that basename.
	 */
	public async registerClient() {
		logger.debugFn(arguments);

		const clientBasename = await generateUniqueBasename({
			basePath: `${this.getDocumentDetails().dirname}/clients`,
			prefix: `client_`,
		});
		logger.debugVar('clientBasename', clientBasename);

		this.sessionId = clientBasename;
		logger.debugVar('this.sessionId', this.sessionId);

		const clientDir = `${this.getDocumentDetails().dirname}/clients/${this.sessionId}`;
		logger.debugVar('clientDir', clientDir);

		logger.debug('Make directory', clientDir);
		await Deno.mkdir(clientDir, {
			recursive: true,
		});
	}

	/**
	 * The `unregisterClient` function removes a client directory associated with the current session if
	 * it exists.
	 * @returns If the path does not exist, nothing is returned. If the path exists and is successfully
	 * removed, nothing is returned.
	 */
	public async unregisterClient() {
		logger.debugFn(arguments);

		this.preventDestroyedSession();

		const clientDir = `${this.getDocumentDetails().dirname}/clients/${this.sessionId}`;
		logger.debugVar('clientDir', clientDir);

		if (!await pathExist(clientDir)) {
			logger.debug('Client already unregistered!');
			return;
		}

		logger.debug('remove', clientDir);
		await Deno.remove(clientDir, { recursive: true });
	}

	/**
	 * The function `getCurrentDocumentClientId` returns the text content of a file specified by the
	 * `filenameLocked` property of the document details, if the file exists.
	 * @returns either `false` if the path does not exist, or the text content of the file at the given
	 * path.
	 */
	public async getCurrentDocumentClientId() {
		logger.debugFn(arguments);

		const path = this.getDocumentDetails().filenameLocked;
		logger.debugVar('path', path);

		if (!await pathExist(path)) {
			logger.debug("Locked filename path doesn't exist!");
			return false;
		}

		const clientId = await Deno.readTextFile(path);
		logger.debugVar('clientId', clientId);

		return clientId;
	}

	/**
	 * The function checks if a document is locked by checking if a specific file exists.
	 * @returns The method is returning the result of the pathExist() function, which checks if the file
	 * specified by this.getDocumentDetails().filenameLocked exists.
	 */
	public async isDocumentLocked() {
		logger.debugFn(arguments);

		const isLocked = await pathExist(this.getDocumentDetails().filenameLocked);
		logger.debugVar('isLocked', isLocked);

		return isLocked;
	}

	/**
	 * The `lockDocument` function prevents a destroyed session, checks if the document is already locked,
	 * and writes the session ID to a locked file.
	 * @returns a promise that resolves to the result of writing the session ID to a locked document file.
	 */
	public async lockDocument() {
		logger.debugFn(arguments);

		this.preventDestroyedSession();

		if (await this.isDocumentLocked()) {
			throw `Document already locked by "${await this.getCurrentDocumentClientId()}"!`;
		}

		logger.debug('Locking document');
		return Deno.writeTextFile(this.getDocumentDetails().filenameLocked, this.sessionId);
	}

	/**
	 * The function `releaseDocumentLock` releases the lock on a document file if the current client ID
	 * matches the session ID.
	 * @returns a boolean value. If the current client ID is not equal to the session ID, it will return
	 * false. Otherwise, it will attempt to remove the locked filename and return the result of that
	 * operation.
	 */
	public async releaseDocumentLock() {
		logger.debugFn(arguments);

		this.preventDestroyedSession();

		const currentClientId = await this.getCurrentDocumentClientId();
		logger.debugVar('currentClientId', currentClientId);

		if (currentClientId !== this.sessionId) {
			logger.debug('Invalid client ID!', currentClientId, this.sessionId);
			return false;
		}

		logger.debug('Releasing lock from document');
		return Deno.remove(this.getDocumentDetails().filenameLocked);
	}

	/**
	 * The function `getDocument` reads the contents of a file specified by the `filename` property of
	 * `getDocumentDetails`, and throws an error if the file does not exist.
	 * @returns the contents of the document file as a string.
	 */
	public async getDocument() {
		logger.debugFn(arguments);

		const filename = this.getDocumentDetails().filename;
		logger.debugVar('filename', filename);

		if (!await pathExist(filename)) {
			throw `Document filename doesn't exist "${filename}"!`;
		}

		const document = await Deno.readTextFile(filename);
		logger.debugVar(
			'document',
			document.length > 200 ? `${document.slice(0, 200)}...` : document,
		);

		return document;
	}

	/**
	 * The function "openDocument" waits for the document to be unlocked and then locks it before
	 * returning.
	 * @returns the result of the `lockDocument()` function call.
	 */
	public async openDocument() {
		logger.debugFn(arguments);

		const tick = 100;
		logger.debugVar('tick', tick);

		while (await this.isDocumentLocked()) {
			await new Promise((res) =>
				setTimeout(() => {
					logger.debug('Go to next try');
					res(undefined);
				}, tick)
			);
		}

		return await this.lockDocument();
	}

	/**
	 * The closeDocument function releases the document lock.
	 * @returns The method is returning the result of the `releaseDocumentLock()` method, which is awaited
	 * using the `await` keyword.
	 */
	public async closeDocument() {
		logger.debugFn(arguments);

		return await this.releaseDocumentLock();
	}

	/**
	 * The function updates a document by writing the provided data to a file.
	 * @param {string} data - The `data` parameter is a string that represents the content that you want
	 * to write to a file.
	 * @returns The `updateDocument` function is returning a promise that resolves to the result of
	 * writing the provided `data` to a text file.
	 */
	public async updateDocument(data: string) {
		logger.debugFn();

		return await Deno.writeTextFile(this.getDocumentDetails().filename, data);
	}

	/**
	 * The `setItem` function sets a value for a given key in a document, encoding and decoding the data
	 * as necessary.
	 * @param {string} key - A string representing the key of the item to be stored in the document.
	 * @param {any} value - The `value` parameter is the value that you want to store in the document with
	 * the specified key. It can be of any type.
	 */
	// deno-lint-ignore no-explicit-any
	public async setItem(key: string, value: any) {
		logger.debugFn(arguments);

		await this.openDocument();

		// deno-lint-ignore no-explicit-any
		let data = {} as { [key: string]: any };
		logger.debugVar('data', data);

		try {
			const decodeData = this.decodeData(await this.getDocument());
			logger.debugVar('decodeData', decodeData);

			if (typeof decodeData == 'object') {
				data = decodeData;
				logger.debugVar('data', data);
			}

			data[key] = value;
			logger.debugVar('data[key]', data[key]);

			await this.updateDocument(this.encodeData(data));
		} catch (err) {
			await this.closeDocument();
			throw err;
		}

		await this.closeDocument();
	}

	/**
	 * The function `getItem` retrieves a value from a document by its key.
	 * @param {string} key - The `key` parameter is a string that represents the key of the item you want
	 * to retrieve from the data object.
	 * @returns The value associated with the given key is being returned.
	 */
	public async getItem(key: string) {
		logger.debugFn(arguments);

		await this.openDocument();

		// deno-lint-ignore no-explicit-any
		let data = {} as { [key: string]: any };
		logger.debugVar('data', data);

		try {
			const decodeData = this.decodeData(await this.getDocument());
			logger.debugVar('decodeData', decodeData);

			if (typeof decodeData == 'object') {
				data = decodeData;
				logger.debugVar('data', data);
			}
		} catch (err) {
			await this.closeDocument();
			throw err;
		}

		const value = data[key];
		logger.debugVar('value', value);

		await this.closeDocument();

		return value;
	}

	/**
	 * The `removeItem` function removes an item from a document by its key.
	 * @param {string} key - The `key` parameter is a string that represents the key of the item that you
	 * want to remove from the data object.
	 */
	public async removeItem(key: string) {
		logger.debugFn(arguments);

		await this.openDocument();

		// deno-lint-ignore no-explicit-any
		let data = {} as { [key: string]: any };
		logger.debugVar('data', data);

		try {
			const decodeData = this.decodeData(await this.getDocument());

			if (typeof decodeData == 'object') {
				data = decodeData;
				logger.debugVar('data', data);
			}

			delete data[key];
			logger.debugVar('data[key]', data[key]);

			await this.updateDocument(this.encodeData(data));
		} catch (err) {
			await this.closeDocument();
			throw err;
		}

		await this.closeDocument();
	}
}
