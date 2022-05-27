const { loadResource, LIBS } = require("../libs/fileLoader");
const { Dex } = require("pokemon-showdown");
const { LAST_GEN, range, pokemonIsStandard } = loadResource(LIBS, "util");
const itemsFromShowdown = Dex.items
  .all()
  .filter((move) => pokemonIsStandard(move));
let itemsCollection = [];

const makeItemObject = (rawObject, gen) => ({
  usageName: rawObject.id,
  name: rawObject.name,
  description: rawObject.desc,
  gen,
});

for (const itemFromShowdown of itemsFromShowdown) {
  if (itemFromShowdown.gen != LAST_GEN) {
    let oldGenItem = null;
    for (let gen = itemFromShowdown.gen; gen < LAST_GEN; gen++) {
      oldGenItem = Dex.mod(`gen${gen}`).moves.get(itemFromShowdown.name);
      itemsCollection.push(makeItemObject(oldGenItem, gen));
    }
  }
  itemsCollection.push(makeItemObject(itemFromShowdown, LAST_GEN));
}

const items = Object.values(itemsCollection);
range(1, LAST_GEN).forEach((gen) =>
  items.push({
    usageName: "noitem",
    name: "No Item",
    description: "Pas d'objet tenu",
    gen,
  })
);
module.exports = items;
