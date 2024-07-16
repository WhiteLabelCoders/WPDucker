// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

export const CLI_DIR = {
	main: `${Deno.env.get('HOME')}/.wpd`,
	tmp: `${Deno.env.get('HOME')}/.wpd/tmp`,
	versions: `${Deno.env.get('HOME')}/.wpd/versions`,
	localStorage: `${Deno.env.get('HOME')}/.wpd/localStorage`,
};
