const { loadResource, JSON } = require("../../libs/fileLoader");

const pokemonCollection = loadResource(JSON, "pokemons.json");

test("Pokemon from 3G should have 2 abilities", () => {
  // Non exhaustive list (because it'll be too long to test for all pokemon)
  const eligiblePokemon = ["Abra", "Aerodactyl", "Aggron", "Aipom", "Alakazam"];

  for (const pokemonName of eligiblePokemon) {
    const pokemon = pokemonCollection.find(
      ({ name, gen }) => pokemonName === name && gen === 3
    );
    expect(pokemon.hasOwnProperty("ability_2")).toBe(true);
  }
});

test("There must not be any totem form in 8G", () => {
  expect(
    pokemonCollection.filter(
      ({ name, gen }) => name.includes("-Totem") && gen === 8
    ).length
  ).toBe(0);
});
