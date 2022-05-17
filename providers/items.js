const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_SIMULATOR,
} = require("../libs/fileLoader");
const { Dex } = loadResource(POKEMON_SHOWDOWN_SIMULATOR, "dex");
const { LAST_GEN, range } = loadResource(LIBS, "util");
const itemsFromShowdown = Dex.items.all();
let itemsCollection = [];

const makeItemObject = (rawObject, gen) => ({
  usageName: rawObject.id,
  name: rawObject.name,
  description: rawObject.desc,
  gen,
});

for (const itemFromShowdown of itemsFromShowdown) {
  if (
    itemFromShowdown.isNonstandard &&
    itemFromShowdown.isNonstandard !== "Past"
  )
    continue;
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
items.push({
  usageName: "noitem",
  name: "No Item",
  description: "Pas d'objet tenu",
  gen: range(1, LAST_GEN),
});
module.exports = items;
