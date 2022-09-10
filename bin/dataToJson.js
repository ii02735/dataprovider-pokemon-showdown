let dataToJsonFunction = () => { console.error("The dataToJson mustn't be run in production") }

if(!process.env.NODE_ENV || process.env.NODE_ENV != "prod"){

  const { ModdedDex } = require("../src/pokemon-showdown/.sim-dist/dex.js");
  const AbilitiesProvider = require("../src/providers/abilities.js");
  const PokemonProvider = require("../src/providers/pokemon.js");
  const ItemProvider = require("../src/providers/items.js");
  const TypeProvider = require("../src/providers/types.js");
  const MovesProvider = require("../src/providers/moves.js");
  const LearnProvider = require("../src/providers/learns.js");
  const NaturesProvider = require("../src/providers/natures.js");
  const PokemonTierProvider = require("../src/providers/pokemonTier.js");
  const { writeFile } = require("../src/libs/util.js");

  dataToJsonFunction = () => {
    console.log("Generating JSON from providers data");
    const dex = new ModdedDex();
    writeFile("abilities.json", new AbilitiesProvider(dex));
    writeFile("pokemons.json", new PokemonProvider(dex));
    writeFile("items.json", new ItemProvider(dex));
    writeFile("types.json", new TypeProvider(dex));
    writeFile("moves.json", new MovesProvider(dex));
    writeFile("learns.json", new LearnProvider(dex));
    writeFile("natures.json", new NaturesProvider(dex));
    writeFile("pokemonTier.json", new PokemonTierProvider(dex));
  }

}

export default dataToJsonFunction

