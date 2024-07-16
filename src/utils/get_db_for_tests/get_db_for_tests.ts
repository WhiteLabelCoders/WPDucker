// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { classDatabase } from '../../classes/database/database.ts';
import { cwd } from '../cwd/cwd.ts';

export const getDbForTests = async (name = 'wpd-test') => {
	const dirname = `${cwd()}/test_db_instance`;

	const db = new classDatabase({ dirname });

	await db.init(name);

	return db;
};
