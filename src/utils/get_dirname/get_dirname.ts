// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { dirname } from 'https://deno.land/std@0.200.0/path/mod.ts';

export const getDirname = (path: string) => {
	return dirname(path);
};
