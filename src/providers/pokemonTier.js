import Provider from "./provider.js";
import { LAST_GEN, isStandard, removeParenthesis } from "../libs/util.js";

export default class PokemonTierProvider extends Provider {
  constructor(dex) {
    super(dex);
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      const pokemonsFromShowdown = this.dex
        .mod(`gen${gen}`)
        .species.all()
        .filter((pokemon) => isStandard(pokemon, gen, pokemon.num > 0));
      for (const pokemonFromShowdown of pokemonsFromShowdown) {
        this.collection.push(this.makeObject(pokemonFromShowdown, gen));
        if (!!pokemonFromShowdown.cosmeticFormes) {
          pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
            this.collection.push(
              this.makeObject(
                this.dex.mod(`gen${gen}`).species.get(cosmeticFormName),
                gen
              )
            );
          });
        }
      }
    }
  }

  makeObject(rawObject, gen) {
    return {
      pokemon: rawObject.name,
      technically: rawObject.tier.startsWith("("),
      tier: removeParenthesis(rawObject.tier),
      doubleTiers: rawObject.doublesTier,
      gen,
    };
  }
}
