const { Items } = require('./pokemon-showdown/.data-dist/items');
const { ItemsText } = require('./pokemon-showdown/.data-dist/text/items');
const { LAST_GEN, range, getGenAttributes } = require('./util');

const itemsCollection = Object.entries(Items)
	.filter(
		([key, { isNonstandard }]) =>
			(!isNonstandard ||
			isNonstandard === 'Past' ||
			isNonstandard === 'Unobtainable') && !key.match(/tr\d+/g) // pokemon shouldn't hold TRs --> we remove those items
	)
	.reduce((accumulator, [key, { name }]) => {
		accumulator[key] = {
			name,
			description: ItemsText[key].desc
		}
		return accumulator;
	},{});

// Creating gen property in items
Object.keys(itemsCollection).forEach((key) => {
	
	/**
	 * Fetch desc from other gens
	 */
	const otherGens = getGenAttributes(ItemsText[key]).map((attribute) => parseInt(attribute.replace("gen",""))).sort()
	if(otherGens.length > 0) {
		otherGens.forEach((otherGen) => {

			itemsCollection[Items[key]["name"]+"gen"+otherGen] = {
				name: itemsCollection[key].name,
				description: ItemsText[key]["gen"+otherGen]["desc"],
				gen: [otherGen]
			}
			/**
			 * Remember that pokemon Showdown data for gen logic is reversed based.
			 * If an item has a specific description only for gen3,
			 * it means that the next gens have their descriptions inherited from 
			 * the latest generation ("desc" attribute)
			 * Example for Light Ball :
			 * In gen3.desc : If held by a Pikachu, its Special Attack is doubled. (gen3 only)
			 * In desc (LAST_GEN) : If held by a Pikachu, its Attack and Sp. Atk are doubled. (gen(3+1)...gen(LAST_GEN))
			 * 
			 */
			if(otherGens[otherGens.length - 1] === otherGen)
				itemsCollection[key]["gen"] = range(otherGen+1,LAST_GEN)
			
		})
	}else if(Items[key]["gen"]) //If no other gen found, it means that the item didn't change its description since the original gen (found in gen attribute of Items[key])
		itemsCollection[key]["gen"] = range(Items[key]["gen"],LAST_GEN)
})

const items = Object.values(itemsCollection)
module.exports = items