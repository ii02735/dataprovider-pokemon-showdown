const { Moves } = require('./pokemon-showdown/.data-dist/moves');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');

const moves = Object.entries(Moves)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.map(([key, value]) => ({
		name: value.name,
		category: value.category,
		description: MovesText[key].desc || MovesText[key].shortDesc,
		shortDescription: MovesText[key].shortDesc,
		power: value.basePower,
		pp: value.pp,
		accuracy: value.accuracy === true ? null : value.accuracy,
		type: value.type,
	}));

module.exports = moves