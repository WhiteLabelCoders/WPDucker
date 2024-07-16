// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { basename } from 'https://deno.land/std@0.200.0/path/mod.ts';

export const getBasename = (path: string) => {
	return basename(path);
};
