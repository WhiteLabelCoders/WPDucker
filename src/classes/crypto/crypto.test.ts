// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assert } from '@std/assert';
import { classCrypto } from './crypto.ts';

Deno.test('crypto', async function testCrypto(t) {
	await t.step('simple string', function testSimpleStringCrypto() {
		const str = 'Super power Cryptography!';
		const encoded = classCrypto.encode(str);
		const decoded = classCrypto.decode(encoded);

		assert(str !== encoded, 'encoded result');
		assert(str === decoded, 'decoded result');
	});

	await t.step('long object', function testLongObjectCrypto() {
		const obj = [
			{
				'_id': '65f7094f9b6f9c8e9f474082',
				'index': 0,
				'guid': '2df697f8-8643-49b8-b461-73de6bbb9cc4',
				'isActive': true,
				'balance': '$3,713.23',
				'picture': 'http://placehold.it/32x32',
				'age': 34,
				'eyeColor': 'green',
				'name': 'Burns Dickerson',
				'gender': 'male',
				'company': 'HATOLOGY',
				'email': 'burnsdickerson@hatology.com',
				'phone': '+1 (935) 597-3512',
				'address': '795 Jefferson Avenue, Clinton, Montana, 7069',
				'about':
					'Culpa sit enim in duis do deserunt. Magna esse laborum nisi occaecat consequat qui adipisicing incididunt aliquip ad cupidatat sit nisi Lorem. Deserunt fugiat et fugiat consectetur magna consectetur nisi aliqua deserunt nisi sit elit laboris veniam.\r\n',
				'registered': '2019-05-04T05:47:14 -02:00',
				'latitude': -13.869573,
				'longitude': -172.681351,
				'tags': [
					'duis',
					'non',
					'proident',
					'irure',
					'cupidatat',
					'do',
					'ut',
				],
				'friends': [
					{
						'id': 0,
						'name': 'Michael Herman',
					},
					{
						'id': 1,
						'name': 'Jensen Stewart',
					},
					{
						'id': 2,
						'name': 'Kristen Ray',
					},
				],
				'greeting': 'Hello, Burns Dickerson! You have 8 unread messages.',
				'favoriteFruit': 'apple',
			},
			{
				'_id': '65f7094f63bed441b14f3534',
				'index': 1,
				'guid': 'ac356315-61d5-4487-ae1f-4e2ada0ce2c6',
				'isActive': true,
				'balance': '$3,708.57',
				'picture': 'http://placehold.it/32x32',
				'age': 40,
				'eyeColor': 'blue',
				'name': 'Decker Bridges',
				'gender': 'male',
				'company': 'MELBACOR',
				'email': 'deckerbridges@melbacor.com',
				'phone': '+1 (925) 426-3635',
				'address': '798 Orient Avenue, Needmore, Maine, 5320',
				'about':
					'Tempor irure aliqua proident ipsum culpa labore exercitation eu cillum reprehenderit fugiat. Sint dolore cillum dolore dolor. Consequat in consequat nostrud magna aliqua culpa. Adipisicing adipisicing esse sint nulla non consequat do ex mollit non laboris tempor laborum adipisicing. Ea ad duis laborum sit excepteur. Mollit eu officia adipisicing sunt. Id nostrud commodo aute irure incididunt Lorem nulla tempor sint pariatur do.\r\n',
				'registered': '2014-12-11T07:37:23 -01:00',
				'latitude': -57.835122,
				'longitude': 43.724154,
				'tags': [
					'do',
					'reprehenderit',
					'aliqua',
					'aute',
					'enim',
					'velit',
					'id',
				],
				'friends': [
					{
						'id': 0,
						'name': 'Bridgette Campbell',
					},
					{
						'id': 1,
						'name': 'Bryant Howe',
					},
					{
						'id': 2,
						'name': 'Schultz Watts',
					},
				],
				'greeting': 'Hello, Decker Bridges! You have 5 unread messages.',
				'favoriteFruit': 'banana',
			},
			{
				'_id': '65f7094ff259f783c8337303',
				'index': 2,
				'guid': '758cb3db-8e4d-415e-96ed-aee3561cf30d',
				'isActive': true,
				'balance': '$3,002.72',
				'picture': 'http://placehold.it/32x32',
				'age': 31,
				'eyeColor': 'brown',
				'name': 'Buck Romero',
				'gender': 'male',
				'company': 'OATFARM',
				'email': 'buckromero@oatfarm.com',
				'phone': '+1 (834) 424-2584',
				'address': '958 Bush Street, Sims, Hawaii, 1453',
				'about':
					'Sint duis velit mollit aute ea. Anim exercitation exercitation aliqua adipisicing qui irure aliquip qui commodo cupidatat fugiat nulla voluptate quis. Consequat adipisicing eu commodo ullamco proident duis irure sunt. Anim fugiat irure ullamco cillum sint enim reprehenderit quis culpa.\r\n',
				'registered': '2023-08-26T02:58:09 -02:00',
				'latitude': -53.881226,
				'longitude': -120.024009,
				'tags': [
					'magna',
					'est',
					'id',
					'sint',
					'deserunt',
					'aliqua',
					'laboris',
				],
				'friends': [
					{
						'id': 0,
						'name': 'Mercedes Key',
					},
					{
						'id': 1,
						'name': 'Cleveland Hester',
					},
					{
						'id': 2,
						'name': 'Annmarie French',
					},
				],
				'greeting': 'Hello, Buck Romero! You have 10 unread messages.',
				'favoriteFruit': 'strawberry',
			},
			{
				'_id': '65f7094f95c7e38c6fa6df44',
				'index': 3,
				'guid': '62d60c88-6043-4eec-bdd1-aacc46c38f60',
				'isActive': true,
				'balance': '$3,475.09',
				'picture': 'http://placehold.it/32x32',
				'age': 34,
				'eyeColor': 'blue',
				'name': 'Marguerite Deleon',
				'gender': 'female',
				'company': 'TECHADE',
				'email': 'margueritedeleon@techade.com',
				'phone': '+1 (983) 429-2944',
				'address': '364 Lewis Avenue, Delwood, Nevada, 2231',
				'about':
					'Laboris proident nostrud incididunt officia occaecat reprehenderit qui ullamco id deserunt id ex incididunt. Nisi esse nulla culpa id nisi. Nisi sint aute minim incididunt labore nulla commodo aute dolore minim duis. Exercitation officia esse officia quis cillum. Ad sit incididunt anim ullamco aute duis consectetur eiusmod aliquip exercitation ea et nisi. Incididunt excepteur nulla dolore reprehenderit sunt in mollit. Consequat veniam laborum culpa Lorem ullamco veniam magna pariatur irure.\r\n',
				'registered': '2023-09-12T11:44:50 -02:00',
				'latitude': -28.621292,
				'longitude': 74.321912,
				'tags': [
					'tempor',
					'consectetur',
					'nisi',
					'incididunt',
					'ipsum',
					'eu',
					'laboris',
				],
				'friends': [
					{
						'id': 0,
						'name': 'Carolina Ayala',
					},
					{
						'id': 1,
						'name': 'Maynard Morton',
					},
					{
						'id': 2,
						'name': 'Rachel Madden',
					},
				],
				'greeting': 'Hello, Marguerite Deleon! You have 9 unread messages.',
				'favoriteFruit': 'strawberry',
			},
			{
				'_id': '65f7094fbf8d4a0f6b044eb0',
				'index': 4,
				'guid': 'dcc7bd4e-9a5c-4a55-aa36-c1d2e08e2d7b',
				'isActive': false,
				'balance': '$3,368.00',
				'picture': 'http://placehold.it/32x32',
				'age': 39,
				'eyeColor': 'blue',
				'name': 'Jayne Dillon',
				'gender': 'female',
				'company': 'KYAGORO',
				'email': 'jaynedillon@kyagoro.com',
				'phone': '+1 (991) 495-3182',
				'address': '491 Garden Street, Bethany, New Hampshire, 3264',
				'about':
					'Laborum amet amet magna proident consequat ut ad sit dolor. Cupidatat aute consectetur Lorem ipsum labore aliqua esse ea amet sit labore. Excepteur qui occaecat eiusmod incididunt consequat dolor magna cupidatat proident culpa laborum cupidatat cillum Lorem. Culpa quis excepteur laboris nulla consectetur.\r\n',
				'registered': '2018-01-27T12:46:48 -01:00',
				'latitude': -27.371684,
				'longitude': -166.505863,
				'tags': [
					'consectetur',
					'labore',
					'id',
					'elit',
					'id',
					'consequat',
					'in',
				],
				'friends': [
					{
						'id': 0,
						'name': 'Katelyn Simmons',
					},
					{
						'id': 1,
						'name': 'Campos Dyer',
					},
					{
						'id': 2,
						'name': 'Aline Griffith',
					},
				],
				'greeting': 'Hello, Jayne Dillon! You have 3 unread messages.',
				'favoriteFruit': 'banana',
			},
		];

		const testData = [
			...obj,
			...obj,
			...obj,
			...obj,
			...obj,
			...obj,
		];

		const encoded2 = classCrypto.encode(JSON.stringify(testData));
		const decoded2 = classCrypto.decode(encoded2);

		assert(typeof obj != typeof encoded2, 'encoded2 result');
		assert(JSON.stringify(testData) == decoded2, 'decoded2 result');
	});
});
