const { LAST_GEN, pokemonIsStandard } = require("../libs/util");
const { Dex } = require("pokemon-showdown");
let movesCollection = [];
let movesFromShowdown = Dex.moves
  .all()
  .filter((move) => pokemonIsStandard(move));

const makeMoveObject = (rawObject, gen) => ({
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
});

for (const moveFromShowdown of movesFromShowdown) {
  if (moveFromShowdown.gen != LAST_GEN) {
    let oldGenMove = null;
    for (let gen = moveFromShowdown.gen; gen < LAST_GEN; gen++) {
      oldGenMove = Dex.mod(`gen${gen}`).moves.get(moveFromShowdown.name);
      movesCollection.push(makeMoveObject(oldGenMove, gen));
    }
  }
  movesCollection.push(makeMoveObject(moveFromShowdown, LAST_GEN));
}

module.exports = Object.values(movesCollection);
