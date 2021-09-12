const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const { Learnsets } = require('./pokemon-showdown/.data-dist/learnsets');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');
const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');
const { pokemonIsStandard, range } = require('./util');
const moves = require('./moves');

const learns = [];

/**
 * Returns all the valid gens when a pokemon can learn a specific move
 * @param {string} moveName the move's name
 * @param {*} learnsetMoveData the learnset array
 * @returns an array of numbers
 */
const createGenArray = (moveName,learnsetMoveData) => {
	// the array obtained for the pokemon's move in his learnset
	// it is a string array that will be converted to a number array (each number is the generation number)
	const parsedArrayFromLearnsetMoveData = Array.from(new Set(learnsetMoveData.map((rawGen) => parseInt(rawGen[0])))).sort()
	// This array (parsedArrayFromLearnsetMoveData) can have gaps : [3,7,8] instead of [3,4,5,6,7,8]
	// So we fill it by merging with the following strategy :
	/**
	 * We take the array that might have gaps, and merging with a range of values, 
	 * beginning from the first index (= the lowest gen, because it is a sorted array, when the move can be learnt by the pokemon)
	 * to the highest generation, that can be missing in parsedArrayFromLearnsetMoveData, so we take it from availableGensByMove
	 * and to avoid duplicate, we first convert the merged array into a set
	 */
	const highestGenAvailable = availableGensByMove[moveName][availableGensByMove[moveName].length - 1] 
	return Array.from(new Set([...parsedArrayFromLearnsetMoveData, ...range(parsedArrayFromLearnsetMoveData[0],highestGenAvailable)])).sort()
}

/**
 * Return an object that shows for each move, the valid generations
 * Structure : { 'move name': [gens] }
 */
const availableGensByMove = moves.reduce((accumulator,object) => {
	if(!/Not available in gen \d/.test(object["description"])){
		if(accumulator[object.name])
			accumulator[object.name] = [...accumulator[object.name], ...object["gen"]].sort()
		else
			accumulator[object.name] = object["gen"]
	}
	return accumulator
},{})

Object.entries(Learnsets)
	.filter(([key, value]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
	.forEach(([key, value]) => {
		if (value.learnset) {
			Object.keys(value.learnset).forEach(move => {
				learns.push({
					pokemon: PokedexText[key] ? PokedexText[key].name : key,
					move: MovesText[move] ? MovesText[move].name : move,
					gen: createGenArray(MovesText[move].name,value.learnset[move])
				});
			});
		}
	});

module.exports = learns