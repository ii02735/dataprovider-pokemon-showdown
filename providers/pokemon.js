/**
 * FIXME: bug for provider
 * Zacian with following gens :
 * [3,4,5,6,7,8]
 * However, he only exists in 8th Gen !
 * --> Check if fixed
 *
 * TODO (later) : special forms (cosmetic), and
 * accept GeoDaz"s exceptions
 */

const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_RESOURCE,
} = require("../libs/fileLoader");
const { LAST_GEN } = require("../libs/util");
const { Dex } = require("../pokemon-showdown/.sim-dist/dex");
const pokemonsFromShowdown = Dex.species.all();
let pokemonsCollection = [];

const makePokemonObject = (
  {
    abilities,
    id: usageName,
    num: pokedex,
    name,
    types,
    baseForme,
    weighthg: weight,
    baseStats,
  },
  gen
) => {
  const { hp, atk, def, spa, spd, spe, prevo } = baseStats;
  const [type_1, type_2] = types;
  if (gen < 5) abilities["H"] = null;
  else if (gen < 3) {
    abilities["0"] = null;
    abilities["1"] = null;
  }
  // Sometimes abilities are not put in the pokemon's data with the correct gen
  for (const abilityClassifier of ["0", "1", "H"]) {
    if (abilities[abilityClassifier]) {
      const DexAbility = Dex.mod(`gen${gen}`).abilities.get(
        abilities[abilityClassifier]
      );
      abilities[abilityClassifier] = DexAbility.exists ? DexAbility.name : null;
    } else abilities[abilityClassifier] = null;
  }

  const baseForm = baseForme.length > 0 ? baseForme : null;

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
    prevo,
    gen,
    ability_1: abilities["0"],
    ability_2: abilities["1"],
    ability_hidden: abilities["H"],
  };
};

for (const pokemonFromShowdown of pokemonsFromShowdown) {
  if (
    pokemonFromShowdown.isNonstandard &&
    pokemonFromShowdown.isNonstandard !== "Past"
  )
    continue;
  if (pokemonFromShowdown.gen != LAST_GEN) {
    let oldPokemonItem = null;
    for (let gen = pokemonFromShowdown.gen; gen < LAST_GEN; gen++) {
      oldPokemonItem = Dex.mod(`gen${gen}`).species.get(
        pokemonFromShowdown.name
      );
      pokemonsCollection.push(makePokemonObject(oldPokemonItem, gen));
    }
  }
  pokemonsCollection.push(makePokemonObject(pokemonFromShowdown, LAST_GEN));
}

module.exports = pokemonsCollection;
