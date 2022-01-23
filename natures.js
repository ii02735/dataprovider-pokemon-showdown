const { Natures } = require('./pokemon-showdown/.data-dist/natures');

const natures = Object.values(Natures).map(({ name, plus, minus }) => {
	const nature = { name };
	if (plus) nature[plus] = 1;
	if (minus) nature[minus] = -1;
	return nature;
});

module.exports = natures