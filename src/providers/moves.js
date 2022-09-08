import Provider from "./provider.js";
import { isStandard, LAST_GEN } from "../libs/util.js";

export default class MovesProvider extends Provider {
  constructor(dex) {
    super(dex);
  }

  provideCollection() {
    for (let gen = 1; gen <= LAST_GEN; gen++) {
      const movesFromShowdown = this.dex
        .mod(`gen${gen}`)
        .moves.all()
        .filter((move) => isStandard(move, gen, move.gen > 0));

      for (let moveFromShowdown of movesFromShowdown) {
        if (/Hidden Power (\w+)/.test(moveFromShowdown.name)) {
          // recomposing manually the MoveShowdown object instead of
          // assigning values, because those are readonly

          this.collection.push(
            this.makeObject(
              {
                name: `Hidden Power [${moveFromShowdown.type}]`,
                id: ("HiddenPower" + moveFromShowdown.type).toLowerCase(),
                ...moveFromShowdown,
              },
              gen
            )
          );
        } else this.collection.push(this.makeObject(moveFromShowdown, gen));
      }
    }
  }

  makeObject(rawObject, gen) {
    return {
      usageName: rawObject.id,
      name: rawObject.name,
      category: rawObject.category,
      description: rawObject.desc,
      shortDescription: rawObject.shortDesc,
      power: rawObject.basePower,
      pp: rawObject.pp,
      accuracy: rawObject.accuracy,
      type: rawObject.type,
      gen,
    };
  }
}
