/**
 * The getRandomId function generates a random string of characters with a specified length.
 * @param {number} idLength - The `idLength` parameter is the desired length of the random ID that will
 * be generated.
 * @returns The function `getRandomId` returns a randomly generated string of characters with a length
 * specified by the `idLength` parameter.
 */
export const getRandomId = (idLength: number, from = '1234567890qwertyuioplkjhgfdsazxcvbnm') => {
	const availableChars = from;
	const getRandomNumber = (max: number, min: number) =>
		Math.floor(Math.random() * (max - min + 1)) + min;

	let id = '';
	while (id.length < idLength) {
		const randomChar = availableChars[getRandomNumber(availableChars.length - 1, 0)];

		id = `${id}${randomChar}`;
	}

	return id;
};
