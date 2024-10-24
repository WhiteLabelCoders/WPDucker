// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

/**
 * The function `getOsAlias` returns an alias for the operating system and architecture combination, or
 * "Os not recognized" if the combination is not recognized.
 * @param [_os] - The `_os` parameter is an optional parameter that represents the operating system. It
 * is of type `typeof Deno.build.os`, which means it can accept values that are compatible with the
 * `os` property of the `Deno.build` object.
 * @param [_arch] - The `_arch` parameter is the architecture of the operating system. It can have
 * values like `x86_64` for 64-bit systems or `aarch64` for ARM-based systems.
 * @returns The function `getOsAlias` returns a string representing the operating system and
 * architecture alias. The possible return values are:
 */
export const getOsAlias = (
	_os?: typeof Deno.build.os,
	_arch?: typeof Deno.build.arch,
): 'linux_x64' | 'macos_x64' | 'macos_arm' | 'Os not recognized' => {
	const os = _os || Deno.build.os;
	const arch = _arch || Deno.build.arch;

	if (os === 'linux' && arch === 'x86_64') {
		return 'linux_x64';
	} else if (os === 'darwin' && arch === 'x86_64') {
		return 'macos_x64';
	} else if (os === 'darwin' && arch === 'aarch64') {
		return 'macos_arm';
	} else {
		return 'Os not recognized';
	}
};
