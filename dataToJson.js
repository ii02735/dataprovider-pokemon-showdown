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

const pokemonIsStandard = ({ isNonstandard }) =>
	!isNonstandard ||
	isNonstandard === 'Past' || // keep pokemons that are not import in gen8
	isNonstandard === 'Gigantamax' || // keep Gmax forms
	isNonstandard === 'Unobtainable'; // keep Unobtainable real mons

const pokedexEntries = Object.entries(PokedexText);
const getPokemonKeyFromName = pokemonName => {
	if (!pokemonName) return null;
	let pokedexEntry = pokedexEntries.find(([key, { name }]) => name === pokemonName);
	if (!pokedexEntry || !pokedexEntry.length) return null;
	return pokedexEntry[0];
};

const abilities = Object.entries(Abilities)
	.filter(([key, { isNonstandard }]) => !isNonstandard || isNonstandard === 'Past')
	.map(([key, { name }]) => ({
		name,
		description: AbilitiesText[key].desc || AbilitiesText[key].shortDesc,
		shortDescription: AbilitiesText[key].shortDesc,
	}));
writeFile('abilities', abilities);

const items = Object.entries(Items)
	.filter(
		([key, { isNonstandard }]) =>
			!isNonstandard || isNonstandard === 'Past' || isNonstandard === 'Unobtainable'
	)
	.map(([key, { name, itemUser }]) => ({
		name,
		description: ItemsText[key].desc,
		owners: itemUser,
	}));
writeFile('items', items);

const WEAKNESS = { 0: 1, 1: 2, 2: 0.5, 3: 0 }; // translate weakness ratio
const types = Object.entries(TypeChart).map(([key, { damageTaken }]) => ({
	name: key,
	weaknesses: Object.entries(damageTaken).map(([key, value]) => ({
		name: key,
		ratio: WEAKNESS[value],
	})),
}));
writeFile('types', types);

const moves = Object.entries(Moves)
	.filter(([key, { isNonstandard }]) => !isNonstandard || isNonstandard === 'Past')
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
	.filter(([key]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
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
Object.entries(Learnsets).forEach(([pokemonKey, { learnset }]) => {
	if (FormatsData[pokemonKey] && !pokemonIsStandard(FormatsData[pokemonKey])) return;
	const pokemon = Pokedex[pokemonKey];
	// add baseForm learnset if form hasn't learnset
	const baseFormKey = getPokemonKeyFromName(pokemon && pokemon.baseSpecies);
	const baseForm = baseFormKey && Pokedex[baseFormKey];
	if (!learnset) {
		if (!baseFormKey) return null;
		const baseFomLearns = Learnsets[baseFormKey];
		if (!baseFomLearns || !baseFomLearns.learnset) return;
		learnset = baseFomLearns.learnset;
	}
	// add prevo learnset
	// prettier-ignore
	const prevoKey = getPokemonKeyFromName(
		(pokemon && pokemon.prevo) 
		|| (baseForm && baseForm.prevo)
	);
	if (prevoKey) {
		const prevoLearns = Learnsets[prevoKey];
		if (prevoLearns && prevoLearns.learnset) {
			learnset = { ...learnset, ...prevoLearns.learnset };
		}
		const prevo = Pokedex[prevoKey];
		const prevoPrevoKey = getPokemonKeyFromName(prevo && prevo.prevo);
		if (prevoPrevoKey) {
			const prevoPrevoLearns = Learnsets[prevoPrevoKey];
			if (prevoPrevoLearns && prevoPrevoLearns.learnset) {
				learnset = { ...learnset, ...prevoPrevoLearns.learnset };
			}
		}
	}
	const pokemonName = PokedexText[pokemonKey] && PokedexText[pokemonKey].name;
	Object.keys(learnset).forEach(move => {
		learns.push({
			pokemon: pokemonName || pokemonKey,
			move: MovesText[move] ? MovesText[move].name : move,
		});
	});
	// Add move to unreferenced formes
	if (pokemon && pokemon.otherFormes) {
		pokemon.otherFormes.forEach(formeName => {
			const formeKey = getPokemonKeyFromName(formeName);
			if (
				!formeKey ||
				Learnsets[formeKey] ||
				(FormatsData[pokemonKey] && !pokemonIsStandard(FormatsData[pokemonKey]))
			) {
				return;
			}
			Object.keys(learnset).forEach(move => {
				learns.push({
					pokemon: formeName,
					move: MovesText[move] ? MovesText[move].name : move,
				});
			});
		});
	}
});
writeFile('learns', learns);

const natures = Object.values(Natures).map(({ name, plus, minus }) => {
	const nature = { name };
	if (plus) nature[plus] = 1;
	if (minus) nature[minus] = -1;
	return nature;
});
writeFile('natures', natures);

const pokemonTier = Object.entries(FormatsData)
	.filter(([pokemonKey, value]) => pokemonIsStandard(value))
	.map(([pokemonKey, { tier, doublesTier }]) => ({
		pokemon: PokedexText[pokemonKey] ? PokedexText[pokemonKey].name : pokemonKey,
		tier: tier ? removeParenthesis(tier) : undefined,
		technically: tier ? tier.startsWith('(') : false,
		doublesTier: doublesTier ? removeParenthesis(doublesTier) : undefined,
	}));
writeFile('pokemonTier', pokemonTier);
