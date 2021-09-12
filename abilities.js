const { Abilities } = require('./pokemon-showdown/.data-dist/abilities');
const { AbilitiesText } = require('./pokemon-showdown/.data-dist/text/abilities');

const abilities = Object.entries(Abilities)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.map(([key, value]) => ({
		name: value.name,
		description: AbilitiesText[key].desc || AbilitiesText[key].shortDesc,
		shortDescription: AbilitiesText[key].shortDesc,
	}));


module.exports = abilities