const { loadResource, LIBS, DEX } = require("../libs/fileLoader");
const { LAST_GEN, isStandard } = loadResource(LIBS, "util");
const { Dex } = loadResource(DEX);
let pokemonsCollection = [];

const makePokemonObject = (
  {
    abilities,
    id: usageName,
    num: pokedex,
    name,
    types,
    baseSpecies,
    changesFrom,
    weighthg: weight,
    baseStats,
    prevo,
  },
  gen
) => {
  const { hp, atk, def, spa, spd, spe } = baseStats;
  const [type_1, type_2] = types;
  if (gen < 5) abilities["H"] = null;
  else if (gen < 3) {
    abilities["0"] = null;
    abilities["1"] = null;
  }
  // Sometimes abilities are not put in the pokemon's data with the correct gen
  for (const abilityClassifier of ["0", "1", "H", "S"]) {
    if (abilities[abilityClassifier]) {
      const DexAbility = Dex.mod(`gen${gen}`).abilities.get(
        abilities[abilityClassifier]
      );
      abilities[abilityClassifier] = DexAbility.exists ? DexAbility.name : null;
    } else abilities[abilityClassifier] = null;
  }

  // Take in priority changesFrom (for not basic form)
  const baseForm =
    changesFrom ||
    (baseSpecies !== name && baseSpecies.length > 0 ? baseSpecies : null);

  return {
    pokedex,
    usageName,
    name,
    type_1,
    type_2,
    hp,
    atk,
    def,
    spa,
    spd,
    spe,
    weight,
    baseForm,
    prevo: prevo || null,
    gen,
    ability_1: abilities["0"],
    ability_2: abilities["1"] || abilities["S"],
    ability_hidden: abilities["H"],
  };
};

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const pokemonsFromShowdown = Dex.mod(`gen${gen}`)
    .species.all()
    .filter((pokemon) => isStandard(pokemon, gen));
  for (const pokemonFromShowdown of pokemonsFromShowdown) {
    pokemonsCollection.push(makePokemonObject(pokemonFromShowdown, gen));
    if (pokemonFromShowdown.cosmeticFormes)
      pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
        pokemonsCollection.push(
          makePokemonObject(
            Dex.mod(`gen${gen}`).species.get(cosmeticFormName),
            gen
          )
        );
      });
  }
}

module.exports = pokemonsCollection;
