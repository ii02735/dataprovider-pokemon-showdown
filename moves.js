const { Moves } = require('./pokemon-showdown/.data-dist/moves');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');
const { LAST_GEN, movesByGen } = require('./util');

const createDiscriminate = ({ name, category, description, power, pp, accuracy, type }) => JSON.stringify({ name, category, description, power, pp, accuracy, type })

const getGenAttributes = (object) => {
	return Object.keys(object).filter((key) => key.includes('gen'))
}

const findInheritedMovesGenProperty = (gen,moveName,property) => {
	
	for(let _gen = gen; _gen < LAST_GEN; _gen++)
	{
		let nextMoveGen = null;
		
		nextMoveGen = mods(_gen)[moveName]
		
		if(nextMoveGen)
		{
			if(nextMoveGen[property]){
				return nextMoveGen[property];
			}
		}
	}
	return lastGenMoves[moveName][property]
}

/**
 * For some moves, the category is missing for older generations
 * 
 * For example, Aeroblast is a flying type move
 * After gen3, its category is "special", but before
 * it should be "physical" (the category is taken from the type). 
 * 
 * However, this information is missing in .data-dist/mods/gen3/moves
 * @param {number} gen - gen the current gen
 * @param {string} type - type the move's type
 * @param {string} initialCategory - the initial category (will be returned if gen > 3)
 * @returns the correct category
 */
const determineCategory = (gen, type, initialCategory) => {
	
	let beforeGen4 = {}
	for(const type of ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'])
		beforeGen4[type] = 'Physical'
	
	for(const type of ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'])
		beforeGen4[type] = 'Special'
	
	if(gen < 4)
		return beforeGen4[type]
	
	return initialCategory

}

const movesCollection = Object.entries(Moves)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.reduce((accumulator,[key, value]) => ({...accumulator, [createDiscriminate(Object.assign({ description: MovesText[key].desc}, value))]: {
		name: value.name,
		category: value.category,
		description: MovesText[key].desc || MovesText[key].shortDesc,
		shortDescription: MovesText[key].shortDesc,
		power: value.basePower,
		pp: value.pp,
		accuracy: value.accuracy === true ? null : value.accuracy,
		type: value.type,
		gen: [ LAST_GEN ]
	}}),{});

const lastGenMoves = Object.entries(Moves)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.reduce((accumulator,[key, value]) => ({...accumulator, [key]: {
		name: value.name,
		category: value.category,
		description: MovesText[key].desc || MovesText[key].shortDesc,
		shortDescription: MovesText[key].shortDesc,
		power: value.basePower,
		pp: value.pp,
		accuracy: value.accuracy === true ? null : value.accuracy,
		type: value.type
	}}),{});


const mods = (gen) => {

	const { Moves } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/moves`)
	
	return Moves
}

for(let gen=LAST_GEN-1; gen > 0; gen--)
{
	let descriptions = {}
	Object.entries(MovesText)
		  .forEach(([key,value]) => {
			  if(lastGenMoves[key] /** to prevent accessing to NonStandardMoves */ &&
				 movesByGen[key] /** moves like 10000000voltthunderbolt are not reported to be learnt */ &&
				 movesByGen[key].find((genNumber) => genNumber === gen)){
				  
						const multipleDescriptionGen = getGenAttributes(value)
						let description = null
						if(!descriptions[key] && multipleDescriptionGen.length > 0){
							descriptions[key] = {}
							multipleDescriptionGen.forEach((attributeName) => {
								const genNumber = parseInt(attributeName.split("gen")[1]);
								descriptions[key][genNumber] = value[attributeName].desc
							})
							
						}else if(descriptions[key])
							description = descriptions[key].desc
						else
							description = MovesText[key].desc || MovesText[key].shortDesc
						
						const moveGen = {
							name: MovesText[key].name,
							category: determineCategory(gen, lastGenMoves[key].type, lastGenMoves[key].category),
							description,
							shortDescription: MovesText[key].shortDesc,
							power: findInheritedMovesGenProperty(gen,key,"basePower"),
							pp: findInheritedMovesGenProperty(gen,key,"pp"),
							accuracy: findInheritedMovesGenProperty(gen,key,"accuracy"),
							type: lastGenMoves[key].type
						}

						const newDiscriminate = createDiscriminate(moveGen)

						if(movesCollection[newDiscriminate])
							movesCollection[newDiscriminate]["gen"].push(gen)
						else{
							movesCollection[newDiscriminate] = moveGen
							movesCollection[newDiscriminate]["gen"] = [gen]
						}
					
				}
			})
		  
}

Object.keys(movesCollection).forEach((key) => {
	movesCollection[key]["gen"] = movesCollection[key]["gen"].sort()
})

module.exports = Object.values(movesCollection)