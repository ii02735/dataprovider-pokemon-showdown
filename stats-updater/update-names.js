/* Update names */
'use strict';
import Path from 'path';
import FileSystem from 'fs';
import { Dex } from 'pokemon-showdown';

const Names_File = Path.resolve(__dirname, 'resources/names.json');
const Names_File_Min = Path.resolve(__dirname, 'resources/names-min.js');

async function updateNames(formatsData) {
	let names = {};
	let n = 0;

	try {
		names = await import(Names_File);
	} catch (err) {
		console.log('Creating new names file...');
	}

	for (let format of formatsData) {
		if (!format.name) continue;
		let id = toId(format.name);
		if (!id) continue;
		names[id] = format.name;
		n++;
	}

	FileSystem.writeFileSync(
		Names_File_Min,
		'/*Formats*/ window.FormatNames = ' + JSON.stringify(names) + ';'
	);
	FileSystem.writeFileSync(Names_File, JSON.stringify(names, null, 4));

	console.log('DONE: Loaded ' + n + ' format names.');
}

export const start = async function () {
	console.log('Getting formats data 2...');
	await updateNames(Dex.formats.all());
};
