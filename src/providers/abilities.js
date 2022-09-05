import Provider from "./provider.js";
import "dotenv/config";
import { isStandard, LAST_GEN } from "../libs/util.js";

export default class AbilitiesProvider extends Provider {
  constructor(dex) {
    super(dex);
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      this.collection.push({
        usageName: "noability",
        name: "No Ability",
        gen,
      });
    }
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      const abilitiesFromShowdown = this.dex
        .mod(`gen${gen}`)
        .abilities.all()
        .filter(
          (ability) =>
            isStandard(ability, gen, ability.gen > 0) &&
            ability.name !== "No Ability"
        );
      this.collection = this.collection.concat(
        abilitiesFromShowdown.map((rawAbility) => this.makeObject(rawAbility))
      );
    }
  }

  makeObject(rawObject, gen) {
    return {
      usageName: rawObject.usageName,
      name: rawObject.name,
      gen: rawObject.gen,
    };
  }
}
