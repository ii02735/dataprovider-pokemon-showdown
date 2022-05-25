const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_SIMULATOR,
} = require("../libs/fileLoader");
const { LAST_GEN, pokemonIsStandard } = loadResource(LIBS, "util");
const { Dex } = loadResource(POKEMON_SHOWDOWN_SIMULATOR, "dex");
let learns = [];

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

const DexLearnset = (gen, { id }) => {
  return gen > 2
    ? Dex.species.getLearnset(id)
    : Dex.mod(`gen${gen}`).species.getLearnset(id);
};

for (let gen = 1; gen <= LAST_GEN; gen++) {
  for (const pokemonFromShowdown of Dex.mod(`gen${gen}`)
    .species.all()
    .filter((pokemon) => pokemonIsStandard(pokemon))) {
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
      learns.push({
        pokemon: pokemonFromShowdown.name,
        moves: pokemonLearns.map((moveKey) => Dex.moves.get(moveKey).name),
        gen,
      });
  }
}

module.exports = learns;
