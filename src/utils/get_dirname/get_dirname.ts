// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { dirname } from '@std/path/dirname';

export const getDirname = (path: string) => {
	return dirname(path);
};
