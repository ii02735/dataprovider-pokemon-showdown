const path = require("path");
const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_RESOURCE,
} = require("../libs/fileLoader");
const { Ability } = require("../pokemon-showdown/.sim-dist/dex-abilities");
const { Abilities } = loadResource(POKEMON_SHOWDOWN_RESOURCE, "abilities");
const { AbilitiesText } = loadResource(
  POKEMON_SHOWDOWN_RESOURCE,
  "text",
  "abilities"
);
const { getGenAttributes, range, LAST_GEN } = loadResource(LIBS, "util");

const findInheritedAbilityTextGenProperty = (key, gen, property) => {
  let result = null;

  for (let _gen = gen; _gen <= LAST_GEN; _gen++) {
    if (AbilitiesText[key].hasOwnProperty("gen" + _gen)) {
      if (AbilitiesText[key]["gen" + _gen].hasOwnProperty(property)) {
        result = AbilitiesText[key]["gen" + _gen][property];
        break;
      }
    }
  }

  return result;
};

const abilitiesTextCollection = Object.entries(Abilities)
  .filter(
    ([key, { isNonstandard }]) => !isNonstandard || isNonstandard === "Past"
  )
  .reduce((accumulator, [key, { name }]) => {
    accumulator[key] = {
      name,
      description: AbilitiesText[key].desc || AbilitiesText[key].shortDesc,
      shortDescription: AbilitiesText[key].shortDesc,
    };
    return accumulator;
  }, {});

/**
 * Objects that give for each ability their valid gens :
 * {
 * 	 name: "Ability",
 * 	 gen: [3,4,5,6,7,8]
 * }
 */
const abilityGens = (key) => {
  const ability = new Ability(Abilities[key]);
  return range(ability.gen, LAST_GEN);
};

let abilities = [];

// Fetch descriptions in different gens for each ability

Object.entries(abilitiesTextCollection).forEach(([key, value]) => {
  // check if the ability has multiple descriptions
  let otherGens = getGenAttributes(AbilitiesText[key])
    .map((attribute) => parseInt(attribute.replace("gen", "")))
    .sort();

  // If that's the case the initial gen array must be split in different objects :
  /**
   * For example :
   * If the ability in abilityGens has an array like that : [3,4,5,6,7,8]
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

  if (otherGens.length > 0) {
    // Fill possible gaps
    otherGens = range(abilityGens(key)[0], otherGens[otherGens.length - 1]);
    const similarDescriptions = {};

    otherGens.forEach((otherGen, index) => {
      let description =
        findInheritedAbilityTextGenProperty(key, otherGen, "desc") ||
        findInheritedAbilityTextGenProperty(key, otherGen, "shortDesc");
      let shortDescription = findInheritedAbilityTextGenProperty(
        key,
        otherGen,
        "shortDesc"
      );
      const { name } = value;
      const keyAbility = JSON.stringify({
        name,
        description,
        shortDescription,
      });
      if (!similarDescriptions.hasOwnProperty(keyAbility))
        similarDescriptions[keyAbility] = { gen: [] };
      similarDescriptions[keyAbility]["gen"].push(otherGen);
    });

    for (const keyAbility of Object.keys(similarDescriptions)) {
      const { name, description, shortDescription } = JSON.parse(keyAbility);
      const { gen } = similarDescriptions[keyAbility];
      abilities.push({
        usageName: key,
        name,
        description,
        shortDescription,
        gen,
      });
    }

    const gens = range(otherGens.pop(), LAST_GEN);
    gens.shift();

    abilities.push({
      usageName: key,
      name: value.name,
      description: value.description || value.shortDescription,
      shortDescription: value.shortDescription,
      gen: gens,
    });
  } else {
    // If the object has no gens, we push the initial gen array stored in abilityGens in the gen attribute
    const initialAbility = new Ability(Abilities[key]);
    abilities.push({
      usageName: key,
      name: value.name,
      description: value.description || value.shortDescription,
      shortDescription: value.shortDescription,
      gen: range(initialAbility.gen, LAST_GEN),
    });
  }
});
// Fill "No Ability" gen array

abilities[0]["gen"] = range(1, LAST_GEN);

module.exports = abilities;
