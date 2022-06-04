const { loadResource, LIBS, DEX } = require("../libs/fileLoader");
const { removeParenthesis, LAST_GEN, isStandard } = loadResource(LIBS, "util");
const { Dex } = loadResource(DEX);
const pokemonsFromShowdown = Dex.species
  .all()
  .filter((pokemon) => isStandard(pokemon));
let pokemonTier = [];

const makePokemonTierObject = ({ name, tier, doubleTiers }, gen) => ({
  pokemon: name,
  technically: tier.startsWith("("),
  tier: removeParenthesis(tier),
  doubleTiers,
  gen,
});

for (let gen = 1; gen <= LAST_GEN; gen++) {
  const pokemonsFromShowdown = Dex.mod(`gen${gen}`)
    .species.all()
    .filter((pokemon) => isStandard(pokemon, gen));
  for (const pokemonFromShowdown of pokemonsFromShowdown)
    pokemonTier.push(makePokemonTierObject(pokemonFromShowdown, gen));
}

module.exports = pokemonTier;
