import Provider from "./provider.js";
import "dotenv/config";
import { isStandard } from "../libs/util.js";

export default class LearnProvider extends Provider {
  constructor(dex) {
    super(dex);

    this.typesForHiddenPower = this.dex.types
      .all()
      .filter((type) => type.name !== "Normal" && type.name !== "Fairy")
      .map((type) => type.name);
  }

  getEligibleMovesForGen(pokemonLearnset, gen) {
    return Object.entries(pokemonLearnset)
      .filter(([_, genArray]) => {
        genArray = Array.from(
          new Set(genArray.map((stringGen) => parseInt(stringGen)))
        ).sort();
        return genArray[0] <= gen;
      })
      .flatMap(([moveKey, _]) => moveKey)
      .reduce((acc, move) => ({ ...acc, [move]: move }), {});
  }

  /**
   * Fetch learnset from Smogon's Dex
   * @param {SpeciesData} pokemon The Pokemon instance (from Smogon's Dex)
   * @param {number} gen The desired generation
   * @private
   * @returns
   */
  getDexLearnset(pokemon, gen) {
    return gen > 2
      ? this.dex.species.getLearnset(pokemon.id)
      : this.dex.mod(`gen${gen}`).species.getLearnset(pokemon.id);
  }

  getLearnsetForPokemon(pokemon, gen) {
    const dexLearnset = this.getDexLearnset(pokemon, gen);
    let result = this.getEligibleMovesForGen(dexLearnset || {}, gen);
    let otherLearnset = {};

    while (pokemon.prevo) {
      pokemon = this.dex.mod(`gen${gen}`).species.get(pokemon.prevo);
      otherLearnset = this.getDexLearnset(pokemon, gen) || {};
      result = {
        ...result,
        ...this.getEligibleMovesForGen(otherLearnset, gen),
      };
    }

    return result;
  }

  isRegional(pokemon) {
    const regions = ["Alola", "Hisui", "Galar"];
    return (
      !!regions.find((region) => pokemon.forme.includes(region)) &&
      pokemon.forme !== ""
    );
  }

  provideCollection() {
    for (let gen = 1; gen <= process.env.LAST_GEN; gen++) {
      const pokemonsFromShowdown = this.dex.mod(`gen${gen}`).species.all();
      for (const pokemonFromShowdown of pokemonsFromShowdown) {
        if (!isStandard(pokemonFromShowdown, gen, pokemonFromShowdown.num > 0))
          continue;
        let learn = this.makeObject(pokemonFromShowdown, gen);

        if (!!learn && learn.moves.length > 0) {
          if (gen >= 2) {
            // Apply modifications for Hidden Power
            learn.moves.concat(
              this.typesForHiddenPower.map((type) => `Hidden Power [${type}]`)
            );
            this.collection.push(learn);
            if (!!pokemonFromShowdown.cosmeticFormes) {
              // Add same learn for cosmetic forms
              pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
                learn.pokemon = this.dex
                  .mod(`gen${gen}`)
                  .species.get(cosmeticFormName).name;
                this.collection.push(learn);
              });
            }
          } else this.collection.push(learn);
        }
      }
    }
  }

  makeObject(pokemon, gen) {
    let currentLearnset = this.getLearnsetForPokemon(pokemon, gen);

    /**Inherit base species learnset to forms
     * Regional forms are not considered
     * (alolan ninetales cannot learn flare blitz, but regular ninetales can)
     **/
    if (pokemon.baseSpecies !== pokemon.name && !this.isRegional(pokemon)) {
      const baseSpeciesFromShowdown = this.dex
        .mod(`gen${gen}`)
        .species.get(pokemon.baseSpecies);
      if (isStandard(pokemon, null, pokemon.num > 0)) {
        currentLearnset = {
          ...currentLearnset,
          ...this.getLearnsetForPokemon(baseSpeciesFromShowdown, gen),
        };
      }
    }

    // Sometimes, the desired learnset from pokemon showdown doesn't exist

    if (!currentLearnset) {
      return null;
    }

    return {
      pokemon: pokemon.name,
      moves: Object.values(currentLearnset).map(
        (move) => this.dex.moves.get(move).name
      ),
      gen,
    };
  }
}
