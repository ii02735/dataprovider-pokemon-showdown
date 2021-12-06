const { Moves } = require('./pokemon-showdown/.data-dist/moves');
const { MovesText } = require('./pokemon-showdown/.data-dist/text/moves');
const { LAST_GEN, movesByGen } = require('./util');

const createDiscriminate = ({ name, category, description, power, pp, accuracy, type }) => JSON.stringify({ name, category, description, power, pp, accuracy, type })

const getGenAttributes = (object) => {
	return Object.keys(object).filter((key) => key.includes('gen')).reduce((acc,index) => {
		acc[index] = index;
		return acc
	},{})
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
	if(property === "basePower")
		property = "power"
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
	
	if(initialCategory === "Status")
		return initialCategory

	let beforeGen4 = {}
	for(const type of ['Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel'])
		beforeGen4[type] = 'Physical'
	
	for(const type of ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'])
		beforeGen4[type] = 'Special'
	
	if(gen < 4)
		return beforeGen4[type]
	
	return initialCategory

}

const lastGenMoves = Object.entries(Moves)
	.filter(([key, { isNonstandard } ]) => !isNonstandard || isNonstandard === 'Past')
	.reduce((accumulator,[key, value]) => ({...accumulator, [key]: {
		name: value.name,
		category: value.category,
		description: value.isNonstandard === 'Past' ? `Not available in gen ${LAST_GEN}` : (MovesText[key].desc || MovesText[key].shortDesc),
		shortDescription: MovesText[key].shortDesc,
		power: value.basePower,
		pp: value.pp,
		accuracy: value.accuracy === true ? null : value.accuracy,
		type: value.type
	}}),{});

const movesCollection = Object.entries(lastGenMoves)
	.reduce((accumulator,[key, value]) => {
		accumulator[createDiscriminate(value)] = {
			...value,
			gen: [ LAST_GEN ]
		}
		return accumulator;
	},{});


const mods = (gen) => {

	const { Moves } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/moves`)
	
	return Moves
}

for(let gen=LAST_GEN-1; gen > 0; gen--)
{
	Object.entries(MovesText)
		  .forEach(([key,value]) => {
			  if(lastGenMoves[key] /** to prevent accessing to NonStandardMoves */ &&
				 movesByGen[key] /** moves like 10000000voltthunderbolt are not reported to be learnt */ &&
				 movesByGen[key].find((genNumber) => genNumber === gen)){
				  
						const multipleDescriptionGen = getGenAttributes(value)

						const moveGen = {
							name: MovesText[key].name,
							category: determineCategory(gen, lastGenMoves[key].type, lastGenMoves[key].category),
							description: Object.keys(multipleDescriptionGen).length > 0 && multipleDescriptionGen["gen"+gen] ? (MovesText[key][multipleDescriptionGen["gen"+gen]].desc || MovesText[key][multipleDescriptionGen["gen"+gen]].shortDesc) : (MovesText[key].desc || MovesText[key].shortDesc),
							shortDescription:  Object.keys(multipleDescriptionGen).length > 0 && multipleDescriptionGen["gen"+gen] ? MovesText[key][multipleDescriptionGen["gen"+gen]].shortDesc : MovesText[key].shortDesc,
							power: findInheritedMovesGenProperty(gen,key,"basePower"),
							pp: findInheritedMovesGenProperty(gen,key,"pp"),
							accuracy: lastGenMoves[key].accuracy,
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