const { Natures } = require('./pokemon-showdown/.data-dist/natures');

const natures = Object.values(Natures).map(value => {
	const nature = { name: value.name };
	if (value.plus) nature[value.plus] = 1;
	if (value.minus) nature[value.minus] = -1;
	return nature;
});

module.exports = natures