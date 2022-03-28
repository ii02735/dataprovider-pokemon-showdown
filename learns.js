const { PokedexText } = require("./pokemon-showdown/.data-dist/text/pokedex");
const { Learnsets } = require("./pokemon-showdown/.data-dist/learnsets");
const {
  Learnsets: oldGenLearnsets,
} = require("./pokemon-showdown/.data-dist/mods/gen2/learnsets");
const { MovesText } = require("./pokemon-showdown/.data-dist/text/moves");
const { FormatsData } = require("./pokemon-showdown/.data-dist/formats-data");
const { pokemonIsStandard, range, getPokemonKeyFromName } = require("./util");
const { Pokedex } = require("./pokemon-showdown/.data-dist/pokedex");
const moves = require("./moves");
const { gensByPokemon } = require("./pokemon");

const learns = [];

/**
 * Returns all the valid gens when a pokemon can learn a specific move
 * @param {string} moveName the move's name
 * @param {*} learnsetMoveData the learnset array
 * @returns an array of numbers
 */
const createGenArray = (moveName, learnsetMoveData) => {
  // the array obtained for the pokemon's move in his learnset
  // it is a string array that will be converted to a number array (each number is the generation number)
  const parsedArrayFromLearnsetMoveData = Array.from(
    new Set(learnsetMoveData.map((rawGen) => parseInt(rawGen[0])))
  ).sort();
  // This array (parsedArrayFromLearnsetMoveData) can have gaps : [3,7,8] instead of [3,4,5,6,7,8]
  // So we fill it by merging with the following strategy :
  /**
   * We take the array that might have gaps, and merging with a range of values,
   * beginning from the first index (= the lowest gen, because it is a sorted array, when the move can be learnt by the pokemon)
   * to the highest generation, that can be missing in parsedArrayFromLearnsetMoveData, so we take it from availableGensByMove
   * and to avoid duplicate, we first convert the merged array into a set
   */
  const highestGenAvailable =
    availableGensByMove[moveName][availableGensByMove[moveName].length - 1];
  return Array.from(
    new Set([
      ...parsedArrayFromLearnsetMoveData,
      ...range(parsedArrayFromLearnsetMoveData[0], highestGenAvailable),
    ])
  ).sort();
};

/**
 * Return an object that shows for each move, the valid generations
 * Structure : { 'move name': [gens] }
 */
const availableGensByMove = moves.reduce((accumulator, object) => {
  if (!/Not available in gen \d/.test(object["description"])) {
    if (accumulator[object.name])
      accumulator[object.name] = [
        ...accumulator[object.name],
        ...object["gen"],
      ].sort();
    else accumulator[object.name] = object["gen"];
  }
  return accumulator;
}, {});

Object.entries(Learnsets).forEach(([pokemonKey, { learnset }]) => {
  if (FormatsData[pokemonKey] && !pokemonIsStandard(FormatsData[pokemonKey]))
    return;
  const pokemon = Pokedex[pokemonKey];
  // add baseForm learnset if form hasn't learnset
  const baseFormKey = getPokemonKeyFromName(pokemon && pokemon.baseSpecies);
  const baseForm = baseFormKey && Pokedex[baseFormKey];
  if (baseFormKey) {
    const baseFormLearns = Learnsets[baseFormKey];
    if (!baseFormLearns || !baseFormLearns.learnset) return;
    learnset = { ...learnset, ...baseFormLearns.learnset };
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
  Object.keys(learnset).forEach((move) => {
    let learnsetData = learnset[move];
    if (
      oldGenLearnsets[pokemonKey] &&
      oldGenLearnsets[pokemonKey]["learnset"][move]
    )
      learnsetData = learnsetData.concat(
        oldGenLearnsets[pokemonKey]["learnset"][move]
      );
    if (MovesText[move]) {
      learns.push({
        pokemon: pokemonName || pokemonKey,
        move: MovesText[move] ? MovesText[move].name : move,
        gen: createGenArray(MovesText[move].name, learnsetData),
      });
    }
  });
  // Add move to unreferenced formes
  if (pokemon && pokemon.otherFormes) {
    pokemon.otherFormes.forEach((formeName) => {
      const formeKey = getPokemonKeyFromName(formeName);
      if (
        !formeKey ||
        !gensByPokemon[formeKey] ||
        Learnsets[formeKey] ||
        (FormatsData[pokemonKey] && !pokemonIsStandard(FormatsData[pokemonKey]))
      ) {
        return;
      }
      Object.keys(learnset).forEach((move) => {
        if (MovesText[move]) {
          let learnsetData = learnset[move];
          if (
            oldGenLearnsets[pokemonKey] &&
            oldGenLearnsets[pokemonKey]["learnset"][move]
          )
            learnsetData = learnsetData.concat(
              oldGenLearnsets[pokemonKey]["learnset"][move]
            );
          let genLearns = createGenArray(MovesText[move].name, learnsetData);

          genLearns =
            genLearns[0] < gensByPokemon[formeKey][0]
              ? genLearns.slice(genLearns.indexOf(gensByPokemon[formeKey][0]))
              : genLearns;

          learns.push({
            pokemon: formeName,
            move: MovesText[move] ? MovesText[move].name : move,
            gen: genLearns,
          });
        }
      });
    });
  }
});
module.exports = learns;
