const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');
const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const { pokemonIsStandard, removeParenthesis } = require('./util');

const pokemonTier = Object.entries(FormatsData)
	.filter(([key, value]) => pokemonIsStandard(value))
	.map(([key, value]) => ({
		pokemon: PokedexText[key] ? PokedexText[key].name : key,
		tier: value.tier ? removeParenthesis(value.tier) : undefined,
		technically: value.tier ? value.tier.startsWith('(') : false,
		doublesTier: value.doublesTier ? removeParenthesis(value.doublesTier) : undefined,
	}));

module.exports = pokemonTier