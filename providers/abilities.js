import { Dex } from "pokemon-showdown";
import { loadResource, LIBS } from "../libs/fileLoader";
const { LAST_GEN, isStandard, range } = loadResource(LIBS, "util");

const makeAbilityObject = ({ id: usageName, name, flags }, gen) => ({
  usageName,
  name,
  gen,
  flags,
});

let abilities = range(1, LAST_GEN).map((gen) => ({
  usageName: "noability",
  name: "No Ability",
  gen,
}));

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const abilitiesFromShowdown = Dex.mod(`gen${gen}`)
    .abilities.all()
    .filter(
      (ability) =>
        isStandard(ability, gen, ability.gen > 0) &&
        ability.name !== "No Ability"
    );
  for (const abilityFromShowdown of abilitiesFromShowdown)
    abilities.push(makeAbilityObject(abilityFromShowdown, gen));
}

export default abilities;
