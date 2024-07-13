import { basename } from 'https://deno.land/std@0.200.0/path/mod.ts';

export const getBasename = (path: string) => {
	return basename(path);
};
