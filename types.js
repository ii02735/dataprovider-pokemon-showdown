const { TypeChart } = require('./pokemon-showdown/.data-dist/typechart');

const WEAKNESS = { 0: 1, 1: 2, 2: 0.5, 3: 0 }; // translate weakness ratio
const types = Object.entries(TypeChart).map(([key, value]) => ({
	name: key,
	weaknesses: Object.entries(value.damageTaken).map(([key, value]) => ({
		name: key,
		ratio: WEAKNESS[value],
	})),
}));

module.exports = types