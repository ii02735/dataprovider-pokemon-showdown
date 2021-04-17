// TODO retirer la fin des pokemons missingno + CAP + pokemon studio
'use strict';
const fileSystem = require('fs');
const { Abilities } = require('./pokemon-showdown/.data-dist/abilities');
const { AbilitiesText } = require('./pokemon-showdown/.data-dist/text/abilities');
const { Items } = require('./pokemon-showdown/.data-dist/items');
const { ItemsText } = require('./pokemon-showdown/.data-dist/text/items');
const { TypeChart } = require('./pokemon-showdown/.data-dist/typechart');
const { Moves } = require('./pokemon-showdown/.data-dist/moves');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');
const { Pokedex } = require('./pokemon-showdown/.data-dist/pokedex');
const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const { Learnsets } = require('./pokemon-showdown/.data-dist/learnsets');
const { Natures } = require('./pokemon-showdown/.data-dist/natures');
const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');

const removeParenthesis = string => string.replace(/\(+/g, '').replace(/\)+/g, '');

const log = (name, e) => {
	if (e) {
		console.error(`Erreur lors de la création du  fichier ${name}.json :`, e);
	} else {
		console.info(`Création du fichier ${name}.json réussi`);
	}
};

// prettier-ignore
const writeFile = (fileName, values) => fileSystem.writeFile(
	`json/${fileName}.json`,
	JSON.stringify(values),
	e => log(fileName, e)
);

const pokemonIsStandard = value =>
	!value.isNonstandard ||
	value.isNonstandard === 'Past' || // keep pokemons that are not import in gen8
	value.isNonstandard === 'Gigantamax' || // keep Gmax forms
	value.isNonstandard === 'Unobtainable'; // keep Unobtainable real mons

const abilities = Object.entries(Abilities)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.map(([key, value]) => ({
		name: value.name,
		description: AbilitiesText[key].desc || AbilitiesText[key].shortDesc,
		shortDescription: AbilitiesText[key].shortDesc,
	}));
writeFile('abilities', abilities);

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
writeFile('items', items);

const WEAKNESS = { 0: 1, 1: 2, 2: 0.5, 3: 0 }; // translate weakness ratio
const types = Object.entries(TypeChart).map(([key, value]) => ({
	name: key,
	weaknesses: Object.entries(value.damageTaken).map(([key, value]) => ({
		name: key,
		ratio: WEAKNESS[value],
	})),
}));
writeFile('types', types);

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
writeFile('moves', moves);

const pokemons = Object.entries(Pokedex)
	.filter(([key, value]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
	.map(([key, value]) => ({
		name: value.name,
		type_1: value.types[0],
		type_2: value.types[1],
		hp: value.baseStats.hp,
		atk: value.baseStats.atk,
		def: value.baseStats.def,
		spa: value.baseStats.spa,
		spd: value.baseStats.spd,
		spe: value.baseStats.spe,
		ability_1: value.abilities[0],
		ability_2: value.abilities[1],
		ability_hidden: value.abilities['H'],
		weight: value.weightkg,
		baseForm: value.baseSpecies,
		prevo: value.prevo,
	}));
writeFile('pokemons', pokemons);

const learns = [];
Object.entries(Learnsets)
	.filter(([key, value]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
	.forEach(([key, value]) => {
		if (value.learnset) {
			Object.keys(value.learnset).forEach(move => {
				learns.push({
					pokemon: PokedexText[key] ? PokedexText[key].name : key,
					move: MovesText[move] ? MovesText[move] : move,
				});
			});
		}
	});
writeFile('learns', learns);

const natures = Object.values(Natures).map(value => {
	const nature = { name: value.name };
	if (value.plus) nature[value.plus] = 1;
	if (value.minus) nature[value.minus] = -1;
	return nature;
});
writeFile('natures', natures);

const pokemonTier = Object.entries(FormatsData)
	.filter(([key, value]) => pokemonIsStandard(value))
	.map(([key, value]) => ({
		pokemon: PokedexText[key] ? PokedexText[key].name : key,
		tier: value.tier ? removeParenthesis(value.tier) : undefined,
		technically: value.tier ? value.tier.startsWith('(') : false,
		doublesTier: value.doublesTier ? removeParenthesis(value.doublesTier) : undefined,
	}));
writeFile('pokemonTier', pokemonTier);
