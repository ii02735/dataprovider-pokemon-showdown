const { DEX, loadResource } = require("../libs/fileLoader");
const { LAST_GEN, isStandard } = require("../libs/util");
const { Dex } = loadResource(DEX);
let movesCollection = [];

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

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const movesFromShowdown = Dex.mod(`gen${gen}`)
    .moves.all()
    .filter((item) => isStandard(item, gen));
  for (const moveFromShowdown of movesFromShowdown) {
    if (/Hidden Power (\w+)/.test(moveFromShowdown.name)) {
      moveFromShowdown.name = `Hidden Power [${moveFromShowdown.type}]`;
      moveFromShowdown.id = (
        "HiddenPower" + moveFromShowdown.type
      ).toLowerCase();
    }
    movesCollection.push(makeMoveObject(moveFromShowdown, gen));
  }
}

module.exports = movesCollection;
