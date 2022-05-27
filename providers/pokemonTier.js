const { loadResource, LIBS } = require("../libs/fileLoader");
const { removeParenthesis, LAST_GEN, pokemonIsStandard } = loadResource(
  LIBS,
  "util"
);
const { Dex } = require("pokemon-showdown");
const pokemonsFromShowdown = Dex.species
  .all()
  .filter((pokemon) => pokemonIsStandard(pokemon));
let pokemonTier = [];

const makePokemonTierObject = ({ name, tier, doubleTiers }, gen) => ({
  pokemon: name,
  technically: tier.startsWith("("),
  tier: removeParenthesis(tier),
  doubleTiers,
  gen,
});

for (const pokemonFromShowdown of pokemonsFromShowdown) {
  if (pokemonFromShowdown.gen != LAST_GEN) {
    for (let gen = pokemonFromShowdown.gen; gen < LAST_GEN; gen++) {
      const oldGenPokemon = Dex.mod(`gen${gen}`).species.get(
        pokemonFromShowdown.name
      );
      if (!oldGenPokemon.tier) continue;
      pokemonTier.push(makePokemonTierObject(oldGenPokemon, gen));
    }
  }
  pokemonTier.push(makePokemonTierObject(pokemonFromShowdown, LAST_GEN));
}

module.exports = pokemonTier;
