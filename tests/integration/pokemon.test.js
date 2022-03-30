const pokemonCollection = require("../../pokemon").flatMap((pokemon_object) =>
  pokemon_object.gen.map((gen) => ({ ...pokemon_object, gen }))
);

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
