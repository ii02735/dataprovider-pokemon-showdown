const { Abilities } = require('./pokemon-showdown/.data-dist/abilities');
const { AbilitiesText } = require('./pokemon-showdown/.data-dist/text/abilities');
const pokemonCollection = require('./pokemon');
const { getGenAttributes, range, LAST_GEN } = require('./util');

const abilitiesTextCollection = Object.entries(Abilities)
	.filter(([key, value]) => !value.isNonstandard || value.isNonstandard === 'Past')
	.reduce((accumulator,[key, value]) => ({...accumulator,[key]:{
		name: value.name,
		description: AbilitiesText[key].desc || AbilitiesText[key].shortDesc,
		shortDescription: AbilitiesText[key].shortDesc
	}}),{});

// Method in order to create keys for abilitiesGen and to use them in abilities object
const createKey = (name) => name.replace(/\W+/g,"").toLowerCase()

/**
 * Objects that give for each ability their valid gens :
 * {
 * 	 name: "Ability",
 * 	 gen: [3,4,5,6,7,8]
 * }
 */
const abilitiesGen = pokemonCollection.filter(({ability_1,ability_2,ability_hidden}) => ability_1 || ability_2 || ability_hidden)
									  .reduce((accumulator,{ability_1,ability_2,ability_hidden,gen}) => {
										  	
											for(const ability of [ability_1,ability_2,ability_hidden]){
												if(ability){
													abilityKey = createKey(ability)
												if(accumulator[abilityKey])
													accumulator[abilityKey] = Array.from(new Set([...accumulator[abilityKey],...gen])).sort()
												else
													accumulator[abilityKey] = gen
												}
											}
											return accumulator
											
									  },{})


let abilities = []

// Fetch descriptions in different gens for each ability

Object.entries(abilitiesTextCollection).forEach(([key,value]) => {

	// check if the ability has multiple descriptions
	const otherGens = getGenAttributes(AbilitiesText[key]).map((attribute) => parseInt(attribute.replace("gen",""))).sort()

	// If that's the case the initial gen array must be split in different objects :
	/**
	 * For example :
	 * If the ability in abilitiesGen has an array like that : [3,4,5,6,7,8]
	 * And the ability in abilitiesTextCollection has in otherGens, an array like [4] (gen4)
	 * So its structure is like that :
	 * {
	 * 		name: "Ability Name",
	 *      desc: "description",
	 * 		shortDesc: "short description",
	 * 		gen4: {
	 * 			desc: "description gen4",
	 * 			shortDesc: "short description gen4"
	 * 		}
	 * }
	 * The split will give the following result :
	 * [{
	 * 		name: "Ability Name",
	 * 		description: "description",
	 * 		shortDescription: "shortDescription",
	 * 		gen: [5,6,7,8]
	 * },{
	 * 		name: "Ability Name",
	 * 		description: "description gen4",
	 * 		shortDescription: "short description gen4",
	 * 		gen: [3,4] //the description of gen4 is in fact the same in gen3 (reverse inheritance)
	 * }]
	 */
	if(otherGens.length > 0)
	{
		otherGens.forEach((otherGen,index) => {
		
			abilities.push({
				name: value.name,
				description: AbilitiesText[key]["gen"+otherGen].desc || AbilitiesText[key]["gen"+otherGen].shortDesc,
				shortDescription: AbilitiesText[key]["gen"+otherGen].shortDesc,
				gen: index == 0 ? range(abilitiesGen[key][0],otherGen) : [otherGen]
			})
		})

		const gens = range(otherGens.pop(),LAST_GEN);
		gens.shift()
		
		abilities.push({
			name: value.name,
			description: value.description || value.shortDescription,
			shortDescription: value.shortDescription,
			gen: gens
		})
	
	}else{
		// If the object has no gens, we push the initial gen array stored in abilitiesGen in the gen attribute
		abilities.push({
				name: value.name,
				description: value.description || value.shortDescription,
				shortDescription: value.shortDescription,
				gen: abilitiesGen[key]
		})
	} 
})

// Fill "No Ability" gen array

abilities[0]["gen"] = range(1,LAST_GEN)

module.exports = abilities