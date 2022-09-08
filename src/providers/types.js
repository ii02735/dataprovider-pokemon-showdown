import { isStandard, LAST_GEN } from "../libs/util.js";
import Provider from "./provider.js";

/**
 * Smogon's damageTaken property with its different values
 */

const NORMAL = 0;
const STRONG = 1;
const WEAK = 2;
const IMMUNE = 3;

const WEAKNESS = {
  [NORMAL]: 1,
  [STRONG]: 2,
  [WEAK]: 0.5,
  [IMMUNE]: 0,
}; // translate weakness ratio

export default class TypeProvider extends Provider {
  constructor(dex) {
    super(dex);
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      this.dex
        .mod(`gen${gen}`)
        .types.all()
        .filter((type) => isStandard(type))
        .forEach((type) => this.collection.push(this.makeObject(type, gen)));
    }
  }

  makeObject(rawObject, gen) {
    return {
      name: rawObject.name,
      weaknesses: Object.entries(rawObject.damageTaken)
        .filter(([typeAttacker]) =>
          isStandard(this.dex.mod(`gen${gen}`).types.get(typeAttacker))
        )
        .map(([typeAttacker, value]) => ({
          name: typeAttacker,
          ratio: WEAKNESS[value],
        })),
      gen,
    };
  }
}
