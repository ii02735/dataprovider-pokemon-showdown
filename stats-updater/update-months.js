/* Update months */

'use strict';

import Path from 'path';
import FileSystem from 'fs';
import Http from 'https';
import Parser from './parse-file.js';

const Smogon_Stats_URL = 'https://www.smogon.com/stats/';
const path = [__dirname, '..', 'usages'];
const Months_File = Path.resolve(...path, 'months-available.json');

export const start = function () {
	console.log('Getting months data...');
	Http.get(Smogon_Stats_URL, res => {
		let data = '';
		res.on('data', chunk => {
			data += chunk;
		});
		res.on('end', () => {
			console.log('GET: ' + Smogon_Stats_URL);
			let months = Parser.parseMonthsList(data);
			FileSystem.writeFileSync(Months_File, JSON.stringify(months));
			console.log('DONE: Loaded months list.');
		});
	}).on('error', e => {
		console.error(e);
	});
};

export const check = function () {
	let months = { list: [] };
	const path = [__dirname, '..', 'usages'];
	let files = FileSystem.readdirSync(Path.resolve(...path, 'months'));
	for (let file of files) {
		console.log(file);
		if (/[0-9][0-9][0-9][0-9]-[0-9][0-9].*/.test(file)) {
			months.list.push(file);
		}
	}
	return months;
};

export const checkAndUpdate = function () {
	let months = check();
	console.log(months);
	const path = [__dirname, '..', 'usages'];
	FileSystem.writeFileSync(
		Path.resolve(...path, 'months.json'),
		JSON.stringify(months)
	);
};
