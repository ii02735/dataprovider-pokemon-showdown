const fileSystem = require('fs');
const { Learnsets } = require("./pokemon-showdown/.data-dist/learnsets")

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

const pokemonIsStandard = value =>
	!value.isNonstandard ||
	value.isNonstandard === 'Past' || // keep pokemons that are not import in gen8
	value.isNonstandard === 'Gigantamax' || // keep Gmax forms
	value.isNonstandard === 'Unobtainable' &&  // keep Unobtainable real mons
	value.tier !== 'Illegal'


/**
 * There is no other way to find a move's gen (unlike for pokemon by reading 
 * the format-data file for each gen or for items by accessing the gen property in the items file)
 * Hence, we have no choice to read and parse the learnsets file
 * 
 * The learnsets file tells what moves can be learned from all pokemon,
 * it can be either by leveling, evolution, transferring by generation... it is safe to assume
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

Object.entries(movesByGen).forEach(([key,values]) => {
    movesByGen[key] = values.sort()
})

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
	range
}