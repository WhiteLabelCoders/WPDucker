import { secretKey } from '../../pre_compiled/__secret_key.ts';
import { Aes } from 'https://deno.land/x/crypto@v0.10.1/aes.ts';
import { Cbc, Padding } from 'https://deno.land/x/crypto@v0.10.1/block-modes.ts';
import { logger } from '../../global/logger.ts';
import { generateCrptoKey } from '../../utils/generate_crypto_key/generate_crypto_key.ts';

export class classCrypto {
	private static key = generateCrptoKey(secretKey);

	constructor() {
		logger.debugFn(arguments);
	}

	public static encode(x: string) {
		const te = new TextEncoder();
		const key = te.encode(this.key);
		const data = te.encode(x);
		const iv = new Uint8Array(16);
		const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
		const encrypted = cipher.encrypt(data);
		const stringifed = JSON.stringify(encrypted);

		return stringifed;
	}

	public static decode(x: string) {
		const te = new TextEncoder();
		const td = new TextDecoder();
		const parsed = JSON.parse(x);
		const key = te.encode(this.key);
		const data = new Uint8Array(Object.values(parsed));
		const iv = new Uint8Array(16);
		const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
		const decrypted = decipher.decrypt(data);
		const decoded = td.decode(decrypted);

		return decoded;
	}
}
