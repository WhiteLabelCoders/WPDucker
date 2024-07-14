import { classDatabase } from '../../classes/database/database.ts';
import { cwd } from '../cwd/cwd.ts';

export const getDbForTests = async (name = 'wpd-test') => {
	const dirname = `${cwd()}/test_db_instance`;

	const db = new classDatabase({ dirname });

	await db.init(name);

	return db;
};
