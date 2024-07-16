// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

/**
 * The `formatDate` function takes a `Date` object and returns a formatted string in the format
 * "YYYY-MM-DD HH:MM:SS.SSS".
 * @param date - The `date` parameter is a JavaScript `Date` object that represents a specific date and
 * time.
 * @returns The function `formatDate` returns a formatted string representing the date and time in the
 * format "YYYY-MM-DD HH:MM:SS.SSS".
 */
export function formatDate(date: Date) {
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based, so we add 1.
	const year = date.getFullYear().toString();
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

	const formatedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

	return formatedDate;
}
