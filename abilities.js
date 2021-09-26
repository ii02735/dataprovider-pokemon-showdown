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

Object.entries(abilitiesTextCollection).forEach(([key,value]) => {
	/**
	 * Fetch desc from other gens
	 */
	const otherGens = getGenAttributes(AbilitiesText[key]).map((attribute) => parseInt(attribute.replace("gen",""))).sort()

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
		abilities.push({
				name: value.name,
				description: value.description || value.shortDescription,
				shortDescription: value.shortDescription,
				gen: abilitiesGen[key]
		})
	} 
})


console.log(abilities)