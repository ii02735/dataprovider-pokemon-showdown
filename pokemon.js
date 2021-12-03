const { Pokedex } = require('./pokemon-showdown/.data-dist/pokedex');
const { FormatsData } = require('./pokemon-showdown/.data-dist/formats-data');
const { pokemonIsStandard, LAST_GEN } = require('./util');
const gensByPokemon = {} // will be used for learns
const createDiscriminant = ({name,baseStats,types,abilities}) => JSON.stringify({name,baseStats,types,abilities})

const pokemons = Object.entries(Pokedex)
	.filter(([key, value]) => !FormatsData[key] || pokemonIsStandard(FormatsData[key]))
	.reduce((accumulator, [key,value]) => {

		gensByPokemon[key] = [LAST_GEN]

		accumulator[createDiscriminant(value)] = {
		...value,
		gen: [LAST_GEN]
		}

		return accumulator;
	},{});


/**
 * Prepare mods' dataset
 * @param {number} gen generation number
 * @returns an object with the FormatsData and the Pokedex for the specified gen
 */
const mods = (gen) => {

	const { FormatsData } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/formats-data`)
	const cleanedFormatsData = Object.keys(FormatsData).reduce((accumulator,key) => {
		
		if(pokemonIsStandard(FormatsData[key]))
		{
			const FormatsDataPokemon = FormatsData[key]
			accumulator[key] = FormatsDataPokemon;
			return accumulator;
		}
		return accumulator

	},{})
	
	let ModPokedex = null;
	if(gen != 3){
		const { Pokedex } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/pokedex`)
		ModPokedex = Pokedex
	}

	return { ModFormatsData: cleanedFormatsData, ModPokedex }
}

/**
 * Remove incompatible abilities' parameters
 * regarding a specific gen
 * @param {number} gen 
 * @param {{}} object 
 * @returns 
 */
const cleanAbilities = (gen, object) => {

	object = JSON.parse(JSON.stringify(object))

	if(object['abilities']){
			if(gen < 5){
				delete object['abilities']['H']
		
			if(gen === 3){
				if(object['abilities']['1'])
					delete object['abilities']['1']
			}else if(gen < 3)
				delete object['abilities']
		}
	}

	return object
}

let modsByGen = {}

for(let gen=LAST_GEN; gen > 0; gen--)
{	
	modsByGen[gen] = {}
	if(gen == LAST_GEN)
	{
		modsByGen[gen]['Pokedex'] = Pokedex
		modsByGen[gen]['FormatsData'] = FormatsData
	}else if(gen != 3){
		const { ModFormatsData, ModPokedex } = mods(gen)
		modsByGen[gen]['Pokedex'] = ModPokedex
		modsByGen[gen]['FormatsData'] = ModFormatsData
	}else{
		const { ModFormatsData } = mods(gen)
		modsByGen[gen]['FormatsData'] = ModFormatsData
	}
	
}

const findInheritedPokemonGenProperty = (gen,pokemonName, property) => {

	for(let _gen = gen; _gen < LAST_GEN; _gen++)
	{
		let nextPokemonGen = null;
		if(_gen == 3)
			nextPokemonGen = modsByGen[4]['Pokedex'][pokemonName]
		else
			nextPokemonGen =  modsByGen[_gen]['Pokedex'][pokemonName]
		
		if(nextPokemonGen)
		{
			if(nextPokemonGen[property]){
				return nextPokemonGen[property];
			}
		}
	}

	return modsByGen[LAST_GEN]['Pokedex'][pokemonName][property]
}

for(let gen=LAST_GEN-1; gen > 0; gen--)
{
	Object.entries(modsByGen[gen]['FormatsData'])
		  .filter(([key,object]) => !modsByGen[gen]['FormatsData'][key] || pokemonIsStandard(!modsByGen[gen]['FormatsData'][key]))
		  .forEach(([key,object]) => {

				if(key != 'missingno' && modsByGen[LAST_GEN]['Pokedex'][key]){ //missingno is Custom in 8th gen however, it is Unobtainable in 1st gen
					
					/**
					 * We retrieve the latest pokemon's gen
					 * And we modify it with the correct parameters according to the other gens
					 * (no abilities, no fairy type etc.)
					 * 
					 * Because the pokemon object has nested objects
					 * We must make a DEEP COPY of it
					 */
					
					const lastGenPokemon = JSON.parse(JSON.stringify(modsByGen[LAST_GEN]['Pokedex'][key]))
					
					// Will check and fetch values of next gen (smogon system uses reverse inheritence, example : gen1 inherit values from gen2)
					const inheritedPokemonInfo = { 
						baseStats: findInheritedPokemonGenProperty(gen,key,'baseStats'),
						abilities: findInheritedPokemonGenProperty(gen,key,'abilities'),
						types: findInheritedPokemonGenProperty(gen,key,'types')
					}
					


					const richGenPokemonObject = cleanAbilities(gen,Object.assign(lastGenPokemon, inheritedPokemonInfo))
					const discriminant = createDiscriminant(richGenPokemonObject)

					if(pokemons.hasOwnProperty(discriminant)){
						pokemons[discriminant]['gen'].push(gen)
						gensByPokemon[key].push(gen);
					} else {
						pokemons[discriminant] = richGenPokemonObject
						pokemons[discriminant]['gen'] = [gen]
						if(gensByPokemon[key])
							gensByPokemon[key].push(gen);
					}

				}
				
	})
		
}

const resultPokemons = Object.values(pokemons).map((value) => { 
	const object = ({
		name: value.name,
		type_1: value.types[0],
		type_2: value.types.length > 1 ? value.types[1] : null,
		hp: value.baseStats.hp,
		atk: value.baseStats.atk,
		def: value.baseStats.def,
		spa: value.baseStats.spa,
		spd: value.baseStats.spd,
		spe: value.baseStats.spe,
		weight: value.weightkg,
		baseForm: value.baseSpecies ? value.baseSpecies : null,
		prevo: value.prevo ? value.prevo : null,
		gen: value.gen.sort()
	})

	if(value.abilities){
		if(value.abilities['0'])
			object["ability_1"] = value.abilities['0']
		if(value.abilities['1'])
			object["ability_2"] = value.abilities['1']
		if(value.abilities['H'])
			object["ability_hidden"] = value.abilities['H']
	}

	return object
	
})

Object.values(gensByPokemon).forEach((value) => value.sort())
module.exports = resultPokemons
module.exports.gensByPokemon = gensByPokemon