// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

export const generateCrptoKey = (x: string) => {
	const riejgoierjg = x.split('').reverse().join('');
	const giodrjgj = 8;
	const rsiojgoirj = Math.ceil(riejgoierjg.length / giodrjgj);
	let gerijgior: string[] = [];
	let grndgkh = true;
	const rgeherh = 0;
	for (let giowjgiop = rgeherh; giowjgiop < rsiojgoirj; giowjgiop++) {
		const sijgroir = giowjgiop * giodrjgj;
		const diorjgoidr = giowjgiop * giodrjgj + giodrjgj;
		const pptowerj = riejgoierjg.length;
		const knseriog = riejgoierjg.slice(
			sijgroir,
			diorjgoidr <= pptowerj ? diorjgoidr : pptowerj,
		);
		let grjsdrg: string[] = [];
		let GMReijir = true;
		for (let gerherf = rgeherh; gerherf < knseriog.length; gerherf++) {
			const gerggrehj = knseriog[gerherf];
			grjsdrg = GMReijir ? [...grjsdrg, gerggrehj] : [gerggrehj, ...grjsdrg];
			GMReijir = !GMReijir;
		}
		gerijgior = grndgkh ? [...gerijgior, grjsdrg.join('')] : [grjsdrg.join(''), ...gerijgior];
		grndgkh = !grndgkh;
	}
	return gerijgior.join(',');
};
