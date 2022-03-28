const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');
const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const { pokemonIsStandard, removeParenthesis, LAST_GEN } = require('./util');

let pokemonTier = Object.entries(FormatsData)
	.filter(([key, value]) => pokemonIsStandard(value))
	.map(([key, value]) => ({
		pokemon: PokedexText[key] ? PokedexText[key].name : key,
		tier: value.tier ? removeParenthesis(value.tier) : undefined,
		technically: value.tier ? value.tier.startsWith('(') : false,
		doublesTier: value.doublesTier ? removeParenthesis(value.doublesTier) : undefined,
		gen: LAST_GEN
	}));


for(let gen=1; gen < LAST_GEN; gen++)
{
	const { FormatsData } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/formats-data`);
	pokemonTier = pokemonTier.concat(Object.entries(FormatsData)
	.filter(([key, value]) => pokemonIsStandard(value))
	.map(([key, value]) => ({
		pokemon: PokedexText[key] ? PokedexText[key].name : key,
		tier: value.tier ? removeParenthesis(value.tier) : undefined,
		technically: value.tier ? value.tier.startsWith('(') : false,
		doublesTier: value.doublesTier ? removeParenthesis(value.doublesTier) : undefined,
		gen
	})));

}


module.exports = pokemonTier