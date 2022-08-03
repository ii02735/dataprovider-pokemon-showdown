const { loadResource, LIBS, DEX } = require("../libs/fileLoader");
const { LAST_GEN, isStandard } = loadResource(LIBS, "util");
const { Dex } = loadResource(DEX);
let learns = [];

/**
 * Unfortunately, a pokemon learnset doesn't exist for each gen.
 * Instead, smogon gathers multiple gen for each move, however some of them
 * cannot be learnt for a specific gen. So we must clean it first.
 * @param {*} pokemonLearnset
 * @param {int} gen desired gen
 * @returns an object with the name of the moves of the correct gen
 */
const getEligibleMovesForGen = (pokemonLearnset, gen) => {
  return Object.entries(pokemonLearnset)
    .filter(([_, genArray]) => {
      genArray = Array.from(
        new Set(genArray.map((stringGen) => parseInt(stringGen)))
      ).sort();
      return genArray[0] <= gen;
    })
    .flatMap(([moveKey, _]) => moveKey)
    .reduce((acc, move) => ({ ...acc, [move]: move }), {});
};

const isRegional = (species) => {
  const regions = ["Alola", "Hisui", "Galar"];
  return (
    !!regions.find((region) => species.forme.includes(region)) &&
    species.forme !== ""
  );
};

/**
 * Fetch the correct learnset's asset
 * @param {int} gen the desired gen
 * @param {*} id the pokemon object (the id is the contained usage name)
 * @returns
 */
const DexLearnset = (gen, { id }) => {
  return gen > 2
    ? Dex.species.getLearnset(id)
    : Dex.mod(`gen${gen}`).species.getLearnset(id);
};

const makeLearnsObject = ({ name: pokemon }, pokemonLearns, gen) => ({
  pokemon,
  moves: pokemonLearns.map((moveKey) => Dex.moves.get(moveKey).name),
  gen,
});

let typesForHiddenPower = Dex.types
  .all()
  .filter((type) => type.name !== "Normal" && type.name !== "Fairy")
  .map((type) => type.name);

/**
 *
 * @param {Species} species
 * @param {int} gen
 */
const genLearnsetForSpecies = (species, gen) => {
  let result = getEligibleMovesForGen(DexLearnset(gen, species) || {}, gen);
  let otherLearnset = {};
  while (species.prevo) {
    species = Dex.mod(`gen${gen}`).species.get(species.prevo);
    otherLearnset = DexLearnset(gen, species) || {};
    result = { ...result, ...getEligibleMovesForGen(otherLearnset, gen) };
  }
  return result;
};

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const pokemonsFromShowdown = Dex.mod(`gen${gen}`)
    .species.all()
    .filter((pokemon) => isStandard(pokemon, gen, pokemon.num > 0));
  for (const pokemonFromShowdown of pokemonsFromShowdown) {
    pokemonLearns = genLearnsetForSpecies(pokemonFromShowdown, gen);

    /**Inherit base species learnset to forms
     * Regional forms are not considered
     * (alolan ninetales cannot learn flare blitz, but regular ninetales can)
     **/
    if (
      pokemonFromShowdown.baseSpecies !== pokemonFromShowdown.name &&
      !isRegional(pokemonFromShowdown)
    ) {
      let baseSpeciesFromShowdown = Dex.mod(`gen${gen}`).species.get(
        pokemonFromShowdown.baseSpecies
      );
      if (
        isStandard(
          baseSpeciesFromShowdown,
          null,
          baseSpeciesFromShowdown.num > 0
        )
      ) {
        pokemonLearns = {
          ...pokemonLearns,
          ...genLearnsetForSpecies(baseSpeciesFromShowdown, gen),
        };
      }
    }
    if (pokemonLearns) {
      if (gen >= 2) {
        const generatedLearns = makeLearnsObject(
          pokemonFromShowdown,
          Object.values(pokemonLearns),
          gen
        );
        // Apply modifications for Hidden Power (provide type name in brackets)
        generatedLearns.moves = generatedLearns.moves.concat(
          typesForHiddenPower.map((type) => `Hidden Power [${type}]`)
        );
        learns.push(generatedLearns);
        // Add learns for cosmetic forms
        if (pokemonFromShowdown.cosmeticFormes)
          pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
            generatedLearns.pokemon = Dex.mod(`gen${gen}`).species.get(
              cosmeticFormName
            ).name;
            learns.push(generatedLearns);
          });
      } else
        learns.push(
          makeLearnsObject(
            pokemonFromShowdown,
            Object.values(pokemonLearns),
            gen
          )
        );
    }
  }
}

module.exports = learns;

// Exported for TDD

module.exports.isRegional = isRegional;
