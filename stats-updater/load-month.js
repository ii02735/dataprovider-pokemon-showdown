/* Months loader */
'use strict';
import Path from 'path';
import FileSystem from 'fs';
import Http from 'https';
import Parser from './parse-file.js';
import Loader from './load-format.js';
import monthsData from Path.resolve(__dirname, '..', 'usages', 'months-available.json');
let months = monthsData.months;
const path = [__dirname, '..', 'usages'];

const Smogon_Stats_URL = 'https://www.smogon.com/stats/';

function wget(url, callback) {
	Http.get(url, res => {
		let data = '';
		res.on('data', chunk => {
			data += chunk;
		});
		res.on('end', () => {
			let statusCode = res.statusCode;
			if (statusCode !== 200) {
				console.log('Request Failed (' + url + ') / Status Code: ' + statusCode);
				return callback(
					null,
					new Error('Request Failed.\nStatus Code: ' + statusCode)
				);
			}
			console.log('GET: ' + url);
			callback(data);
		});
	}).on('error', e => {
		console.error(e);
		callback(null, e);
	});
}

const errorCallback = (err) => {
  if (err) {
    console.log('Error parsing month: ' + month);
  } else {
    console.log('DONE: Parsed month data for ' + month);
  }
}
export const loadMonth = function (month, callback = errorCallback) {
	if (!callback) callback = function () {};
	console.log('Parsing month: ' + month);
	wget(Smogon_Stats_URL + month + '/', (data, err) => {
		if (err) {
			return callback(err);
		}
		data = Parser.parseFormatsList(data);
		mkdir(Path.resolve(...path, 'months'));
		mkdir(Path.resolve(...path, 'months', month));
		mkdir(Path.resolve(...path, 'months', month, 'formats'));
		FileSystem.writeFileSync(
			Path.resolve(...path, 'months', month, 'formats.json'),
			JSON.stringify(data)
		);
		let loader = new Loader(month, data, callback);
		loader.start();
	});
};

export const checkMonth = async function (month, callback) {
	if (!callback) callback = function () {};
	console.log('Parsing month: ' + month);
	let data;
	try {
		data = await import(Path.resolve(...path, 'months', month, 'formats.json'));
	} catch (err) {
		return callback(err);
	}
	let loader = new Loader(month, data, callback);
	loader.start();
};

export const start = function (month) {
	if (!month) {
		console.log('Invalid month.');
		return;
	}
	let exits = false;
	for (let m of months) {
		if (m.id === month) {
			exits = true;
			break;
		}
	}
	if (!exits) {
		console.log('Month not found: ' + month);
		return;
	}
};
