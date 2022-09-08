import { ModdedDex } from "../src/pokemon-showdown/.sim-dist/dex.js";
import AbilitiesProvider from "../src/providers/abilities.js";
import PokemonProvider from "../src/providers/pokemon.js";
import ItemProvider from "../src/providers/items.js";
import TypeProvider from "../src/providers/types.js";
import MovesProvider from "../src/providers/moves.js";
import LearnProvider from "../src/providers/learns.js";
import NaturesProvider from "../src/providers/natures.js";
import PokemonTierProvider from "../src/providers/pokemonTier.js";
import { writeFile } from "../src/libs/util.js";

export default function () {
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
