const { Items } = require('./pokemon-showdown/.data-dist/items');
const { ItemsText } = require('./pokemon-showdown/.data-dist/text/items');

const items = Object.entries(Items)
	.filter(
		([key, value]) =>
			!value.isNonstandard ||
			value.isNonstandard === 'Past' ||
			value.isNonstandard === 'Unobtainable'
	)
	.map(([key, value]) => ({
		name: value.name,
		description: ItemsText[key].desc,
		owners: value.itemUser,
	}));

module.exports = items