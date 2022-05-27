const { loadResource, LIBS } = require("../libs/fileLoader");
const { LAST_GEN, pokemonIsStandard } = loadResource(LIBS, "util");
const { Dex } = require("pokemon-showdown");
let learns = [];

/**
 * Unfortunately, a pokemon learnset doesn't exist for each gen.
 * Instead, smogon gathers multiple gen for each move, so some of them
 * cannot be learnt for a specific gen. So we must clean it first.
 * @param {*} pokemonLearnset
 * @param {int} gen desired gen
 * @returns an array with the name of the moves of the correct gen
 */
const getEligibleMovesForGen = (pokemonLearnset, gen) => {
  return Object.entries(pokemonLearnset)
    .filter(([_, genArray]) => {
      genArray = Array.from(
        new Set(genArray.map((stringGen) => parseInt(stringGen)))
      ).sort();
      return genArray[0] <= gen;
    })
    .flatMap(([moveKey, _]) => moveKey);
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

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const pokemonsFromShowdown = Dex.mod(`gen${gen}`)
    .species.all()
    .filter((pokemon) => pokemonIsStandard(pokemon));
  for (const pokemonFromShowdown of pokemonsFromShowdown) {
    let pokemonLearns = DexLearnset(gen, pokemonFromShowdown);
    let otherLearnset = null;
    if (pokemonLearns)
      pokemonLearns = getEligibleMovesForGen(pokemonLearns, gen);
    if (pokemonFromShowdown.prevo) {
      let prevoFromShowdown = Dex.mod(`gen${gen}`).species.get(
        pokemonFromShowdown.prevo
      );
      otherLearnset = DexLearnset(gen, prevoFromShowdown);
      if (otherLearnset) {
        pokemonLearns = {
          ...pokemonLearns,
          ...getEligibleMovesForGen(otherLearnset, gen),
        };
        pokemonLearns = Object.values(pokemonLearns);
      }
    }
    if (pokemonFromShowdown.baseSpecies !== pokemonFromShowdown.name) {
      let baseSpeciesFromShowdown = Dex.mod(`gen${gen}`).species.get(
        pokemonFromShowdown.baseSpecies
      );
      otherLearnset = DexLearnset(gen, baseSpeciesFromShowdown);
      if (pokemonIsStandard(baseSpeciesFromShowdown) && otherLearnset) {
        pokemonLearns = {
          ...pokemonLearns,
          ...getEligibleMovesForGen(otherLearnset, gen),
        };
        pokemonLearns = Object.values(pokemonLearns);
      }
    }
    if (pokemonFromShowdown.otherFormes) {
      let learnsFromOtherForms = {};
      for (const otherForm of pokemonFromShowdown.otherFormes) {
        let otherFormFromShowdown = Dex.mod(`gen${gen}`).species.get(otherForm);
        if (!pokemonIsStandard(otherFormFromShowdown)) continue;
        otherLearnset = DexLearnset(gen, otherFormFromShowdown);
        if (!otherLearnset) continue;
        learnsFromOtherForms = {
          ...learnsFromOtherForms,
          ...getEligibleMovesForGen(otherLearnset, gen),
        };
      }
      pokemonLearns = { ...pokemonLearns, ...learnsFromOtherForms };
      pokemonLearns = Object.values(pokemonLearns);
    }
    if (pokemonLearns)
      learns.push(makeLearnsObject(pokemonFromShowdown, pokemonLearns, gen));
  }
}

module.exports = learns;
