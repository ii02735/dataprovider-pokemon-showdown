const { TypeChart } = require('./pokemon-showdown/.data-dist/typechart');
const { range, LAST_GEN } = require('./util');

/**
 * Smogon's damageTaken property with its different values
 */
const NORMAL = 0
const STRONG = 1
const WEAK = 2
const IMMUNE = 3

const WEAKNESS = { [NORMAL]: 1, [STRONG]: 2, [WEAK]: 0.5, [IMMUNE]: 0 }; // translate weakness ratio

let types = Object.entries(TypeChart).flatMap(([key, value]) => {

	// Fairy type only exists since 6th gen
	if(key === 'fairy')
	{
		return {
			name: key,
			damageTaken: value.damageTaken,
			gen: range(6,LAST_GEN)
		}
	}
	// Steel and dark types exist since 2nd gen
	if(key === 'steel' || key === 'dark')
	{
		let copyDamageTaken = {...value.damageTaken};
		if(key === 'steel')
			copyDamageTaken.Dark = WEAK // Dark type is weak against steel type from 2 to 5th gen
		delete copyDamageTaken.Fairy 
		return [
			{
				name: key,
				damageTaken: copyDamageTaken, // Fairy type doesn't exist between second and 5th gen
				gen: range(2,5)
			},
			{
				name: key,
				damageTaken: value.damageTaken,
				gen: range(6,LAST_GEN)
			}
		]
	}

	// Return others types that have common rules (unlike steel, dark and fairy)
	return [{
		name: key,
		damageTaken: Object.keys(value.damageTaken).reduce((acc,typeName) => {
			let copyDamageTaken = {...value.damageTaken};
			delete copyDamageTaken.Fairy // Fairy type doesn't exist in first gen
			delete copyDamageTaken.Steel // Steel type doesn't exist in first gen
			delete copyDamageTaken.Dark // Dark type doesn't exist in first gen
			if(typeName !== 'Fairy' && typeName !== 'Steel' && typeName !== 'Dark')
				acc[typeName] = copyDamageTaken[typeName];
			return acc
		},{}),
		gen: [1]
	},{
		name: key,
		damageTaken: Object.keys(value.damageTaken).reduce((acc,typeName) => {
			let copyDamageTaken = {...value.damageTaken};
			delete copyDamageTaken.Fairy // Fairy type doesn't exist between second and 5th gen
			if(typeName !== 'Fairy')
				acc[typeName] = copyDamageTaken[typeName];
			return acc
		},{}),
		gen: range(2,5)
	},{
		name: key,
		damageTaken: value.damageTaken,
		gen: range(6,LAST_GEN)
	}]

})

for(type of types)
{
	type['weaknesses'] = Object.entries(type.damageTaken).map(([typeName,smogonWeakness]) => {
		return {
			name: typeName,
			ratio: WEAKNESS[smogonWeakness]
		}
	})

	delete type.damageTaken
}

types.push({ name: '???', weaknesses: [], gen: [1,2,3,4] })

module.exports = types
