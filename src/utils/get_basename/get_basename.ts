// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { basename } from '@std/path/basename';

export const getBasename = (path: string) => {
	return basename(path);
};
