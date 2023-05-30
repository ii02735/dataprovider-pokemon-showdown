const { LAST_GEN, isStandard } = loadResource(LIBS, "util");

// 1760 est mis en dur dans le React de pikalytics
const buildPath = (pokemonName, tierName, period) =>
	`https://www.pikalytics.com/api/p/${period}/home${tierName}-1760/${pokemonName}`;

const pokemonsFromShowdown = Dex.mod(`gen${LAST_GEN}`)
  .species.all()
  .filter(
    (pokemon) =>
      isStandard(pokemon, gen, pokemon.num > 0) &&
      !(pokemon.forme && /.*Totem/.test(pokemon.forme) && gen != 7)
  );
//   TODO 
//   for (const pokemonFromShowdown of pokemonsFromShowdown) {
//     pokemonsCollection.push(makePokemonObject(pokemonFromShowdown, gen));
//     if (pokemonFromShowdown.cosmeticFormes)
//       pokemonFromShowdown.cosmeticFormes.forEach((cosmeticFormName) => {
//         pokemonsCollection.push(
//           makePokemonObject(
//             Dex.mod(`gen${gen}`).species.get(cosmeticFormName),
//             gen
//           )
//         );
//       });
//   }