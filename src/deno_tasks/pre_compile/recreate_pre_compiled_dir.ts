import { pathExist } from '../../utils/path_exist/path_exist.ts';

export const recreate_pre_compiled_dir = async (pre_compiled_dir: string) => {
	const dirExist = () => pathExist(pre_compiled_dir);
	if (await dirExist()) {
		await Deno.remove(pre_compiled_dir, { recursive: true });
	}

	if (!await dirExist()) {
		await Deno.mkdir(pre_compiled_dir, { recursive: true });
	}
};
