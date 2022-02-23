const fileSystem = require('fs');
const { Learnsets } = require("./pokemon-showdown/.data-dist/learnsets")
const { Learnsets : oldLearnsets } = require("./pokemon-showdown/.data-dist/mods/gen2/learnsets")

const LAST_GEN = 8

const log = (name, e) => {
	if (e) {
		console.error(`Erreur lors de la création du  fichier ${name}.json :`, e);
	} else {
		console.info(`Création du fichier ${name}.json réussi`);
	}
};

const removeParenthesis = string => string.replace(/\(+/g, '').replace(/\)+/g, '');

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
	isNonstandard === 'Unobtainable'  // keep Unobtainable real mons


const { PokedexText } = require('./pokemon-showdown/.data-dist/text/pokedex');
const pokedexEntries = Object.entries(PokedexText);
// Applying GeoDaz's modifications from 0088816fc5ec17b71d085edf26fd7287d1b9b4b6
const getPokemonKeyFromName = (pokemonName) => {
	if (!pokemonName) return null;
	let pokedexEntry = pokedexEntries.find(([key, { name }]) => name === pokemonName);
	if (!pokedexEntry || !pokedexEntry.length) return null;
	return pokedexEntry[0];
};
/**
 * There is no other way to find a move's gen (unlike for pokemon by reading 
 * the format-data file for each gen or for items by accessing the gen property in the items file)
 * Hence, we have no choice to read and parse the learnsets file
 * 
 * The learnsets file tells what moves can be learned from all pokemon,
 * it can either be by leveling, evolution, transferring by generation... it is safe to assume
 * that it gathers all the required data 
 * 
 * The result's structure is the following :
 * @typedef {MoveByGen}
 * @property {string} movename - the shortened move's name (key format)
 * @property {number[]} generations - generations that contain the move
 **/
 
/** 
 * @return {MoveByGen[]}
 */
let movesByGen = Object.values(Learnsets).reduce((accumulator,value) => {
    
    let { learnset } = value
    let moveObjects = {}

    if(learnset){
        Object.entries(learnset).forEach(([moveName,rawGenArray]) => {
   
            rawGenArray = Array.from(new Set(rawGenArray.map((rawGen) => parseInt(rawGen[0]))))
            
            if(accumulator[moveName])
                moveObjects[moveName] = Array.from(new Set(accumulator[moveName].concat(rawGenArray)))
            else
                moveObjects[moveName] = rawGenArray
        })
    }
    
    return {
        ...accumulator,
        ...moveObjects
    }
},{})

movesByGen = Object.values(oldLearnsets).reduce((accumulator,value) => {

	let { learnset } = value
    let moveObjects = {}

    if(learnset){
        Object.entries(learnset).forEach(([moveName,rawGenArray]) => {
   
            rawGenArray = Array.from(new Set(rawGenArray.map((rawGen) => parseInt(rawGen[0]))))
            
            if(accumulator[moveName])
                moveObjects[moveName] = Array.from(new Set(accumulator[moveName].concat(rawGenArray)))
            else
                moveObjects[moveName] = rawGenArray
        })
    }
    
    return {
        ...accumulator,
        ...moveObjects
    }

},movesByGen)

Object.entries(movesByGen).forEach(([key,values]) => {
    movesByGen[key] = values.sort()
})

const getGenAttributes = (object) => {
	return Object.keys(object).filter((key) => key.includes('gen'))
}


/**
 * Returns an array of sequential numbers
 * like in python with the native range statement
 * @param {number} start 
 * @param {number} end 
 * @returns an array of numbers
 */
const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx)

module.exports = {
	writeFile,
	pokemonIsStandard,
	removeParenthesis,
	LAST_GEN,
	movesByGen,
	range,
	getGenAttributes,
	getPokemonKeyFromName
}