const { loadResource, DEX, JSON } = require("../../libs/fileLoader");
const { withoutSpaces } = require("../../libs/util");
const { Dex } = loadResource(DEX);
const pokemonCollection = loadResource(JSON, "pokemons.json");

test("The withoutSpaces function should return the correct usageName", () => {
  for (const pokemon of pokemonCollection) {
    expect(withoutSpaces(pokemon.name)).toBe(Dex.species.get(pokemon.name).id);
  }
});
