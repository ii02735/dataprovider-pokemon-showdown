const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const { Learnsets } = require('./pokemon-showdown/.data-dist/learnsets');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');
const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');
const { pokemonIsStandard } = require('./util');

const learns = [];
Object.entries(Learnsets)
	.filter(([key, value]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
	.forEach(([key, value]) => {
		if (value.learnset) {
			Object.keys(value.learnset).forEach(move => {
				learns.push({
					pokemon: PokedexText[key] ? PokedexText[key].name : key,
					move: MovesText[move] ? MovesText[move].name : move,
					gen: Array.from(new Set(value.learnset[move].map((rawGen) => parseInt(rawGen[0])))).sort()
				});
			});
		}
	});

module.exports = learns