const { loadResource, LIBS, DEX } = require("../libs/fileLoader");
const { LAST_GEN, range } = loadResource(LIBS, "util");
const { Dex } = loadResource(DEX);
const abilitiesFromShowdown = Dex.abilities.all();

const makeAbilityObject = ({ usageName, name }, gen) => ({
  usageName,
  name,
  gen,
});

let abilities = range(1, LAST_GEN).map((gen) => ({
  usageName: "noability",
  name: "No Ability",
  gen,
}));

for (const abilityFromShowdown of abilitiesFromShowdown) {
  if (abilityFromShowdown.gen === 0) continue; // ignore No Ability because already added
  if (abilitiesFromShowdown.gen !== LAST_GEN) {
    for (let gen = abilityFromShowdown.gen; gen < LAST_GEN; gen++)
      abilities.push(makeAbilityObject(abilityFromShowdown, gen));
  }
  abilities.push(makeAbilityObject(abilityFromShowdown, LAST_GEN));
}

module.exports = abilities;
