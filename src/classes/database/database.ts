// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { tql, unsafeRaw, when } from 'jsr:@arekx/teeql';
import type { DB_SCHEMA, typeofTables } from '../../constants/DB_SCHEMA.ts';
import { logger } from '../../global/logger.ts';
import { classDatabaseClient } from '../database_client/database_client.ts';
import { _ } from '../../utils/lodash/lodash.ts';

export class classDatabase {
	public databaseName = '';
	public sessionId: number = 0;
	public dbClient;
	public dbSchema;
	public initialized = false;
	constructor(args: { dbSchema: typeof DB_SCHEMA; dbServerSocketPath: string }) {
		logger.debugFn(arguments);

		const { dbSchema, dbServerSocketPath } = args;

		this.dbClient = new classDatabaseClient({ unixSocket: dbServerSocketPath });
		logger.debugVar('this.dbClient', this.dbClient);

		this.dbSchema = dbSchema;
		logger.debugVar('this.dbSchema', this.dbSchema);
	}

	public async init() {
		logger.debugFn(arguments);

		if (this.initialized) {
			logger.debug('Database is already initialised!');
			return;
		}

		this.initialized = true;
		logger.debugVar('this.initialized', this.initialized);

		if (this.sessionId) {
			logger.debug('Database has the session');
			return;
		}

		this.sessionId = (await this.initializeSession()).LAST_INSERT_ROW_ID;
		logger.debugVar('this.sessionId', this.sessionId);
	}

	public async initializeSession() {
		logger.debugFn(arguments);

		const generateSession = await this.dbClient.query<
			{ LAST_INSERT_ROW_ID: number }
		>`INSERT INTO ${unsafeRaw(this.dbSchema.tables.sessions.name)} DEFAULT VALUES;`;
		logger.debugVar('generateSession', generateSession);

		return generateSession[0];
	}

	public async destroySession() {
		logger.debugFn(arguments);

		if (!this.sessionId && !this.initialized) {
			logger.debug('Session already destroyed!');
			return;
		}

		this.throwIfNoSession();

		this.initialized = false;

		const deleteSessionData = await this.dbClient
			.query`DELETE FROM ${
			unsafeRaw(this.dbSchema.tables.session_data.name)
		} WHERE session_id = ${this.sessionId};`;
		logger.debugVar('deleteSessionData', deleteSessionData);

		const deleteSessionId = await this.dbClient
			.query`DELETE FROM ${
			unsafeRaw(this.dbSchema.tables.sessions.name)
		} WHERE id = ${this.sessionId};`;
		logger.debugVar('deleteSessionId', deleteSessionId);

		this.sessionId = 0;
		logger.debugVar('this.sessionId', this.sessionId);
	}

	public async clearPersistentData() {
		logger.debugFn(arguments);

		const deletePersistentData = await this.dbClient
			.query`DELETE FROM ${unsafeRaw(this.dbSchema.tables.persistent_data.name)};`;
		logger.debugVar('deletePersistentData', deletePersistentData);
	}

	public serializeData<T>(data: T) {
		logger.debugFn(arguments);

		try {
			const serialized = JSON.stringify({ data });
			logger.debugVar('serialized', serialized);

			return serialized;
		} catch (error) {
			logger.error(error);
			return null;
		}
	}
	public deserializeData<T>(data: string) {
		logger.debugFn(arguments);

		try {
			const deserialized = JSON.parse(data)?.data as T;
			logger.debugVar('deserialized', deserialized);

			return deserialized;
		} catch (error) {
			logger.error(error);
			return null;
		}
	}

	public throwIfNoSession() {
		if (!this.sessionId) {
			throw 'Session not initialized!';
		}
	}

	public async setSessionValue<T>(
		key: string,
		value: T,
	) {
		logger.debugFn(arguments);

		this.throwIfNoSession();

		const serializedValue = this.serializeData(value);
		logger.debugVar('serializedValue', serializedValue);

		const insertSessionData = await this.dbClient.query<
			{ LAST_INSERT_ROW_ID: number }
		>`INSERT INTO ${
			unsafeRaw(this.dbSchema.tables.session_data.name)
		} (session_id, key, value) VALUES (${this.sessionId}, ${key}, ${serializedValue}) ON CONFLICT(session_id, key) DO UPDATE SET value = ${serializedValue}, created_at = strftime('%s','now');`;
		logger.debugVar('insertSessionData', insertSessionData);

		return insertSessionData[0].LAST_INSERT_ROW_ID;
	}

	public async setPersistentValue<T>(
		key: string,
		value: T,
	) {
		logger.debugFn(arguments);

		const serializedValue = this.serializeData(value);
		logger.debugVar('serializedValue', serializedValue);

		const insertPersistentData = await this.dbClient.query<
			{ LAST_INSERT_ROW_ID: number }
		>`INSERT INTO ${
			unsafeRaw(this.dbSchema.tables.persistent_data.name)
		} (key, value) VALUES (${key}, ${serializedValue}) ON CONFLICT(key) DO UPDATE SET value = ${serializedValue}, created_at = strftime('%s','now');`;
		logger.debugVar('insertPersistentData', insertPersistentData);

		return insertPersistentData[0].LAST_INSERT_ROW_ID;
	}

	public async getSessionCreatedAt() {
		logger.debugFn(arguments);

		this.throwIfNoSession();

		const selectSessionData = await this.dbClient.query<
			{ created_at: number }
		>`SELECT created_at FROM ${
			unsafeRaw(this.dbSchema.tables.sessions.name)
		} WHERE id = ${this.sessionId};`;
		logger.debugVar('selectSessionData', selectSessionData);

		const timestamp = selectSessionData[0]?.created_at;
		logger.debugVar('timestamp', timestamp);

		return timestamp;
	}

	public deserializeSingularRow<T>(
		row: typeofTables['persistent_data'] | typeofTables['session_data'],
	) {
		logger.debugFn(arguments);

		if (_.isEmpty(row)) {
			return null;
		}

		const deserializedValue = this.deserializeData<T>(row.value);
		logger.debugVar('deserializedValue', deserializedValue);

		const deserializedRow = { ...row, value: deserializedValue };
		logger.debugVar('deserializedRow', deserializedRow);

		return deserializedRow;
	}

	public deserializeMultipleRows<T>(
		rows: typeofTables['persistent_data'][] | typeofTables['session_data'][],
	) {
		logger.debugFn(arguments);

		return rows.map((row) => {
			return this.deserializeSingularRow<T>(row);
		});
	}

	public prepareQueryResult<T>(
		rows: typeofTables['persistent_data'][] | typeofTables['session_data'][],
		singular = true,
	) {
		logger.debugFn(arguments);

		if (singular) {
			return this.deserializeSingularRow<T>(rows[0]);
		} else {
			return this.deserializeMultipleRows<T>(rows);
		}
	}

	public async getSessionValue<T>(key: string) {
		logger.debugFn(arguments);

		this.throwIfNoSession();

		const selectSessionData = await this.dbClient.query<
			typeofTables['session_data']
		>`SELECT * FROM ${
			unsafeRaw(this.dbSchema.tables.session_data.name)
		} WHERE session_id = ${this.sessionId} ${
			when(_.isString(key), tql`AND key = ${key}`, '')
		};`;
		logger.debugVar('selectSessionData', selectSessionData);

		return this.deserializeSingularRow<T>(selectSessionData[0]);
	}

	public async getAllSessionValues<T>() {
		logger.debugFn(arguments);

		this.throwIfNoSession();

		const selectSessionData = await this.dbClient.query<
			typeofTables['session_data']
		>`SELECT * FROM ${
			unsafeRaw(this.dbSchema.tables.session_data.name)
		} WHERE session_id = ${this.sessionId};`;
		logger.debugVar('selectSessionData', selectSessionData);

		return this.deserializeMultipleRows<T>(selectSessionData);
	}

	public async getPersistentValue<T>(key: string) {
		logger.debugFn(arguments);

		const selectPersistentData = await this.dbClient.query<
			typeofTables['persistent_data']
		>`SELECT * FROM ${unsafeRaw(this.dbSchema.tables.persistent_data.name)} ${
			when(_.isString(key), tql`WHERE key = ${key}`, '')
		};`;
		logger.debugVar('selectPersistentData', selectPersistentData);

		return this.deserializeSingularRow<T>(selectPersistentData[0]);
	}

	public async getAllPersistentValues<T>() {
		logger.debugFn(arguments);

		const selectPersistentData = await this.dbClient.query<
			typeofTables['persistent_data']
		>`SELECT * FROM ${unsafeRaw(this.dbSchema.tables.persistent_data.name)};`;
		logger.debugVar('selectPersistentData', selectPersistentData);

		return this.deserializeMultipleRows<T>(selectPersistentData);
	}

	public async removeSessionKey(key: string) {
		logger.debugFn(arguments);

		this.throwIfNoSession();

		const deleteSessionData = await this.dbClient
			.query`DELETE FROM ${
			unsafeRaw(this.dbSchema.tables.session_data.name)
		} WHERE session_id = ${this.sessionId} AND key = ${key};`;
		logger.debugVar('deleteSessionData', deleteSessionData);
	}

	public async removePersistentKey(key: string) {
		logger.debugFn(arguments);

		const deletePersistentData = await this.dbClient
			.query`DELETE FROM ${
			unsafeRaw(this.dbSchema.tables.persistent_data.name)
		} WHERE key = ${key};`;
		logger.debugVar('deletePersistentData', deletePersistentData);
	}
}
