import Provider from "./provider.js";
import "dotenv/config";
import { isStandard, LAST_GEN } from "../libs/util.js";

export default class PokemonProvider extends Provider {
  constructor(dex) {
    super(dex);
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      const pokemonsFromShowdown = this.dex
        .mod(`gen${gen}`)
        .species.all()
        .filter(
          (pokemon) =>
            isStandard(pokemon, gen, pokemon.num > 0) &&
            !(pokemon.forme && /.*Totem/.test(pokemon.forme) && gen === 8)
        );
      for (const pokemonFromShowdown of pokemonsFromShowdown) {
        this.collection.push(this.makeObject(pokemonFromShowdown, gen));
        // Add cosmetic forms
        if (!!pokemonFromShowdown.cosmeticFormes) {
          pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
            const cosmeticForm = this.dex
              .mod(`gen${gen}`)
              .species.get(cosmeticFormName);
            this.collection.push(this.makeObject(cosmeticForm, gen));
          });
        }
      }
    }
  }

  makeObject(rawObject, gen) {
    const [type_1, type_2] = rawObject.types;

    // Remove hidden ability before 5th gen
    if (gen < 5) rawObject.abilities["H"] = null;
    // Remove all abilities before 3th gen
    else if (gen < 3) {
      rawObject.abilities["0"] = null;
      rawObject.abilities["1"] = null;
    }

    // Sometimes abilities are not put in the pokemon's data with the correct gen
    for (const abilityClassifier of ["0", "1", "H", "S"]) {
      if (rawObject.abilities[abilityClassifier]) {
        const abilityFromShowdown = this.dex
          .mod(`gen${gen}`)
          .abilities.get(rawObject.abilities[abilityClassifier]);
        rawObject[abilityClassifier] = abilityFromShowdown.exists
          ? abilityFromShowdown.name
          : null;
      } else rawObject.abilities[abilityClassifier] = null;
    }

    // Take in priority changesFrom (for not basic form)
    const baseForm =
      rawObject.changesFrom ||
      (rawObject.baseSpecies !== rawObject.name &&
      rawObject.baseSpecies.length > 0
        ? rawObject.baseSpecies
        : null);

    return {
      pokedex: rawObject.num,
      usageName: rawObject.id,
      name: rawObject.name,
      type_1,
      type_2,
      ...rawObject.baseStats,
      baseForm,
      prevo: rawObject.prevo || null,
      gen,
      ability_1: rawObject.abilities["0"],
      ability_2: rawObject.abilities["1"] || rawObject["S"],
      ability_hidden: rawObject.abilities["H"],
    };
  }
}
