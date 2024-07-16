// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { logger } from '../../global/logger.ts';
import { getRandomId } from '../../utils/get_random_id/get_random_id.ts';
import { classDocumentStorage } from '../document_storage/document_storage.ts';

/* The `classDatabase` class is a TypeScript class that provides methods for managing a database with session
and persistent data in local storage. */
export class classDatabase {
	public databaseName = '';
	public sessionId = '';
	public localStorage;
	public initialised = false;
	constructor(args: { dirname: string }) {
		logger.debugFn(arguments);

		this.localStorage = new classDocumentStorage(args.dirname);
		logger.debugVar('this.localStorage', this.localStorage);
	}

	/**
	 * The `init` function initializes the session by setting up the local storage, generating a session
	 * ID, and updating the database with the session ID.
	 * @param [name=wpd] - The name parameter is a string that represents the name of the database. By
	 * default, it is set to 'wpd'.
	 * @returns The code is returning the session ID.
	 */
	public async init(name: string) {
		logger.debugFn(arguments);

		if (this.initialised) {
			logger.debug('Database is already initialised!');
			return;
		}

		this.initialised = true;

		await this.localStorage.init();

		this.databaseName = name;
		logger.debugVar('this.databaseName', this.databaseName);

		await this.ensureDatabase();

		if (this.sessionId) {
			logger.debug('Database has the session');
			return;
		}

		this.sessionId = await this.generateSessionId();
		logger.debugVar('this.sessionId', this.sessionId);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		if (database && await this.isValidDatabase()) {
			database.session[this.sessionId] = { _id: this.sessionId };
			logger.debugVar('database.session[this.sessionId]', '*****');

			await this.updateDatabase(database);
		}

		await this.ensureDateOfCreation();
	}

	/**
	 * The function `ensureDateOfCreation` updates the database with the current date if the `_createdAt` key
	 * does not exist in the persistent or session storage.
	 */
	public async ensureDateOfCreation() {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		const key = '_createdAt';
		logger.debugVar('key', key);

		const date = Date.now();
		logger.debugVar('date', date);

		if (!database.persistent?.[key]) {
			database.persistent[key] = date;
			logger.debugVar('database.persistent[key]', database.persistent[key]);
		}

		if (!database.session[this.sessionId]?.[key]) {
			database.session[this.sessionId] = { ...database.session[this.sessionId], [key]: date };
			logger.debugVar('database.session[this.sessionId]', '*****');
		}

		await this.updateDatabase(database);
	}

	/**
	 * The function generates a unique session ID of a specified length.
	 * @param [idLength=32] - The idLength parameter is the length of the session id that will be
	 * generated. It is an optional parameter with a default value of 32.
	 * @returns the generated session id.
	 */
	public async generateSessionId(idLength = 32) {
		logger.debugFn();

		if (!idLength) {
			throw 'Session id length can not be 0!';
		}

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		const sessions = Object.keys(database?.session || {});
		let id = '';
		logger.debugVar('sessions', '*****');

		while (sessions.includes(id) || !id) {
			id = getRandomId(idLength);
			logger.debugVar('id', '*****');
		}

		return id;
	}

	/**
	 * The function returns an initial database object with two properties, "persistent" and "session", both
	 * of which are empty objects.
	 * @returns an object with two properties: "persistent" and "session". The "persistent" property is an
	 * empty object with keys of type string and values of type string, number, object, boolean, or
	 * undefined. The "session" property is also an empty object with keys of type string and values of
	 * type undefined or an object with keys of type string and values of type string,
	 */
	public getInitialDatabase() {
		logger.debugFn(arguments);

		return {
			persistent: {} as { [key: string]: string | number | object | boolean | undefined },
			session: {} as {
				[id: string]: undefined | {
					[key: string]: string | number | object | boolean | undefined;
				};
			},
		};
	}

	/**
	 * The function "setInitialDatabase" asynchronously updates the database with the initial values.
	 */
	public async setInitialDatabase() {
		logger.debugFn(arguments);

		await this.updateDatabase(this.getInitialDatabase());
	}

	/**
	 * The function `getDatabase` retrieves the database from local storage and throws an error if the database is
	 * not found or is invalid.
	 * @returns the value of the `database` variable.
	 */
	public async getDatabase(): Promise<ReturnType<typeof this.getInitialDatabase>> {
		logger.debugFn(arguments);

		const database = await this.localStorage.getItem(this.databaseName);
		logger.debugVar('database', '*****');

		if (!database) {
			throw 'There is no database!';
		}

		if (!await this.isValidDatabase()) {
			throw 'Database is invalid!';
		}

		return database;
	}

	/**
	 * The function updates a database in local storage asynchronously.
	 * @param {T} database - The `database` parameter is a generic type `T` representing the data that needs to
	 * be databased in the local storage. It can be any type of data, such as an object, array, or primitive
	 * value.
	 */
	public async updateDatabase<T>(database: T) {
		logger.debugFn();

		await this.localStorage.setItem(this.databaseName, database);
	}

	/**
	 * The function checks if a database exists in local storage and has both session and persistent
	 * properties.
	 * @returns a boolean value. It returns true if the database exists and has both a session and persistent
	 * property, otherwise it returns false.
	 */
	public async isValidDatabase() {
		logger.debugFn(arguments);

		const database = await this.localStorage.getItem(this.databaseName);
		logger.debugVar('database', '*****');

		const isInvalid = !database || !database?.session || !database?.persistent;
		logger.debugVar('isInvalid', isInvalid);

		if (isInvalid) {
			return false;
		}

		return true;
	}

	/**
	 * The function `ensureDatabase` checks if the database is valid and sets the initial database if it is not.
	 */
	public async ensureDatabase() {
		logger.debugFn(arguments);

		if (!await this.isValidDatabase()) {
			await this.setInitialDatabase();
		}
	}

	/**
	 * The function destroys a session by deleting it from the database and calling a method to destroy it in
	 * local storage.
	 */
	public async destroySession() {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		const shouldDeleteSession = !!(await this.isValidDatabase() && database);
		logger.debugVar('shouldDeleteSession', shouldDeleteSession);

		if (shouldDeleteSession) {
			delete database.session[this.sessionId];
			await this.updateDatabase(database);
		}

		await this.localStorage.destroySession();
	}

	/**
	 * The function clears the persistent data in the database and updates the database, while also ensuring the
	 * date of creation.
	 */
	public async clearPersistent() {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		const shouldDeletePersistent = !!(await this.isValidDatabase() && database);
		logger.debugVar('shouldDeletePersistent', shouldDeletePersistent);

		if (await this.isValidDatabase() && database) {
			database.persistent = {};
			logger.debugVar('database.persistent', database.persistent);

			await this.updateDatabase(database);
		}

		await this.ensureDateOfCreation();
	}

	/**
	 * The function deletes all items from the local storage.
	 */
	public async deleteAll() {
		logger.debugFn(arguments);

		await this.localStorage.removeItem(this.databaseName);
	}

	/**
	 * The function `setSessionValue` sets a value in the session storage and updates the database.
	 * @param {string} key - The key parameter is a string that represents the name of the session value
	 * you want to set. It is used as the property name in the session object.
	 * @param {undefined | string | number | object | boolean} value - The `value` parameter can be of
	 * type `undefined`, `string`, `number`, `object`, or `boolean`.
	 */
	public async setSessionValue(
		key: string,
		value: undefined | string | number | object | boolean,
	) {
		logger.debugFn();
		logger.debugVar('key', key);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		database.session[this.sessionId] = { ...database.session[this.sessionId], [key]: value };
		logger.debugVar('database.session[this.sessionId]', '******');

		await this.updateDatabase(database);
	}

	/**
	 * The function `setPersistentValue` sets a persistent value in a database and updates the database.
	 * @param {string} key - A string representing the key for the persistent value. This key is used to
	 * identify the value in the database.
	 * @param {undefined | string | number | object | boolean} value - The `value` parameter can be of
	 * type `undefined`, `string`, `number`, `object`, or `boolean`.
	 */
	public async setPersistentValue(
		key: string,
		value: undefined | string | number | object | boolean,
	) {
		logger.debugFn();
		logger.debugVar('key', key);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		database.persistent = { ...database.persistent, [key]: value };
		logger.debugVar('database.persistent', '*****');

		await this.updateDatabase(database);
	}

	/**
	 * The function `getSessionValue` retrieves a value from the session database based on a given key, or
	 * returns the entire session if no key is provided.
	 * @param {string} [key] - The `key` parameter is an optional string that represents the specific key
	 * of the session value you want to retrieve. If provided, the function will return the value
	 * associated with that key in the session. If not provided, the function will return the entire
	 * session object.
	 * @returns the value of the session key specified by the `key` parameter, or the entire session
	 * object if `key` is not provided. The return type is specified as `T`, which means it can be any
	 * type.
	 */
	public async getSessionValue<T>(key?: string) {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		let value;

		if (key) {
			value = database.session[this.sessionId]?.[key];
		} else {
			value = database.session[this.sessionId];
		}

		logger.debugVar('value', '*****');

		return value as T;
	}

	/**
	 * The function `getPersistentValue` retrieves a persistent value from a database and logs the value.
	 * @param {string} [key] - The `key` parameter is an optional string that represents the key of the
	 * persistent value you want to retrieve from the database. If a `key` is provided, the function will
	 * return the value associated with that key in the `database.persistent` object. If no `key` is
	 * provided, the
	 * @returns the value of the `output` variable, which is of type `T`.
	 */
	public async getPersistentValue<T>(key?: string) {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		let value;

		if (key) {
			value = database.persistent?.[key];
		} else {
			value = database.persistent;
		}

		logger.debugVar('value', '*****');

		return value as T;
	}

	/**
	 * The function removes a session key from the database and updates the database.
	 * @param {string} key - The `key` parameter is a string that represents the key of the session
	 * key-value pair that needs to be removed from the session.
	 */
	public async removeSessionKey(key: string) {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		delete database.session[this.sessionId]?.[key];

		await this.updateDatabase(database);
	}

	/**
	 * The function removes a persistent key from a database and updates the database.
	 * @param {string} key - The `key` parameter is a string that represents the key of the persistent
	 * data that needs to be removed from the database.
	 */
	public async removePersistentKey(key: string) {
		logger.debugFn(arguments);

		const database = await this.getDatabase();
		logger.debugVar('database', '*****');

		delete database.persistent?.[key];

		await this.updateDatabase(database);
	}
}
