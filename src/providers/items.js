import Provider from "./provider.js";
import "dotenv/config";
import { isStandard, LAST_GEN } from "../libs/util.js";

export default class ItemsProvider extends Provider {
  constructor(dex) {
    super(dex);

    for (let gen = 1; gen < LAST_GEN; gen++) {
      this.collection.push({
        usageName: "noitem",
        name: "No Item",
        description: "Pas d'objet tenu",
        gen,
      });
    }
  }

  /**
   * Check item validity
   * @param {} item
   * @param {number} gen
   * @return {boolean}
   */
  isValidItem(item, gen) {
    return (
      isStandard(item, gen, item.gen > 0) &&
      item.name !== "No item" &&
      !/TR\d+/.test(item.name)
    );
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      const itemsFromShowdown = this.dex
        .mod(`gen${gen}`)
        .items.all()
        .filter((item) => this.isValidItem(item, gen));

      this.collection = this.collection.concat(
        itemsFromShowdown.map((itemAbility) => this.makeObject(itemAbility))
      );
    }
  }

  makeObject(rawObject, gen) {
    return {
      usageName: rawObject.id,
      name: rawObject.name,
      description: rawObject.desc,
      gen: rawObject.gen,
    };
  }
}
