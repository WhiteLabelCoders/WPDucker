import { dirname } from 'https://deno.land/std@0.200.0/path/mod.ts';

export const getDirname = (path: string) => {
	return dirname(path);
};
