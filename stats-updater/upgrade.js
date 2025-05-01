/* Update months */
'use strict';
import Path from 'path';
import rimraf from 'rimraf';
import { checkAndUpdate } from './update-months.js';
import { loadMonth } from './load-months.js';

const path = [__dirname, '..', 'usages'];
const Months_File = Path.resolve(...path, 'months-available.json');

let currMonth = -1;
let monthsList = [];

function upgradeNext() {
	currMonth++;
	if (currMonth >= monthsList.length) {
		console.log('DONE: Upgrade completed.');
		checkAndUpdate();
		return;
	}
	loadMonth(monthsList[currMonth], err => {
		if (err) {
			console.log('Error parsing month: ' + monthsList[currMonth]);
		} else {
			console.log('DONE: Parsed month data for ' + monthsList[currMonth]);
		}
		upgradeNext();
	});
}

export const start = async function (num, doClear) {
	if (num === 'all') {
		console.log('Upgrade All (started)');
	} else {
		num = parseInt(num);
		if (isNaN(num) || num <= 0) {
			console.log('Invalid argument: ' + num);
			return;
		} else {
			console.log('Upgrading last ' + num + ' months...');
		}
	}

	const months_all = await import(Months_File).months;
	const months = await import(Path.resolve(__dirname, 'update-months.js')).check().list;

	if (num === 'all') num = months_all.length;

	let upgradeList = [],
		clearList = [];

	let j = months_all.length - 1;
	for (let i = 0; i < num && i < months_all.length; i++) {
		upgradeList.push(months_all[j].id);
		j--;
	}
	console.log(upgradeList);
	for (let i = 0; i < months.length; i++) {
		if (upgradeList.indexOf(months[i]) === -1) {
			clearList.push(months[i]);
		}
	}

	if (doClear && clearList.length > 0) {
		console.log('Removing old stats files...');
		for (let month of clearList) {
			console.log('DELETE: ' + month);
			rimraf.sync(Path.resolve(__dirname, '../data/months/' + month + '/'));
		}
	}

	if (upgradeList.length === 0) {
		console.log('DONE: Nothing to upgrade.');
		await import(Path.resolve(__dirname, 'update-months.js')).checkAndUpdate();
	} else {
		monthsList = upgradeList;
		upgradeNext();
	}
};
