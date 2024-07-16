// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { cwd } from '../../utils/cwd/cwd.ts';
import { generateVersion } from './generate_version.ts';
import { generateCommandsMeta } from './generate_commands_meta.ts';

const PRECOMPILED_DIR = `${cwd()}/src/pre_compiled`;

await (async function () {
	await generateVersion(`${cwd()}/VERSION`, `${PRECOMPILED_DIR}/__cli_version.ts`);
	await generateCommandsMeta(`${cwd()}/src/commands`, `${PRECOMPILED_DIR}/__commands_meta.ts`);
})();
