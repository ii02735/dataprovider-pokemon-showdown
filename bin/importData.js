import ImportAbilities from "../src/db/importAbilities.js";
import ImportItems from "../src/db/importItems.js";
import ImportMoves from "../src/db/importMoves.js";
import ImportPokemonMoves from "../src/db/importPokemonMoves.js";
import ImportNatures from "../src/db/importNatures.js";
import ImportPokemon from "../src/db/importPokemon.js";
import ImportPokemonTier from "../src/db/importPokemonTier.js";
import { ImportTiers } from "../src/db/importTiers.js";
import { ImportTranslations } from "../src/db/importTranslations.js";
import ImportUsages from "../src/db/importUsages.js";
import ImportUsagesVGC from "../src/db/importUsagesVGC.js";
import knex from "knex";
import "dotenv/config";
import { knexSnakeCaseMappers } from "objection";
import fs from "fs";
import path from "path";
import ImportTags from "../src/db/importTags.js";
import { fileURLToPath } from "url";
import { ImportTypes } from "../src/db/importTypes.js";

/**
 * @param {string} argument
 * @return {Promise<void>}
 */
export default async function (argument) {
  const folderUsagePath = `../json/usages/months/${fs
    .readdirSync(path.resolve("./json/usages/months"))
    .pop()}`;

  const knexClient = knex({
    client: "mysql",
    connection: process.env.CONNECTION_STRING,
    log: {
      warn() {
        // do nothing...it'll hide warning messages
      },
    },
    ...knexSnakeCaseMappers(),
  });

  // Mimic __dirname variable, because it doesn't work for ESM modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const loadData = (_path) =>
    JSON.parse(fs.readFileSync(path.join(__dirname, _path)).toString());

  const scripts = {
    abilities: new ImportAbilities(
      knexClient,
      loadData("../json/abilities.json")
    ),
    items: new ImportItems(knexClient, loadData("../json/items.json")),
    moves: new ImportMoves(knexClient, loadData("../json/moves.json")),
    learns: new ImportPokemonMoves(knexClient, loadData("../json/learns.json")),
    natures: new ImportNatures(knexClient, loadData("../json/natures.json")),
    pokemon: new ImportPokemon(knexClient, loadData("../json/pokemons.json")),
    pokemonTier: new ImportPokemonTier(
      knexClient,
      loadData("../json/pokemonTier.json")
    ),
    tiers: new ImportTiers(
      knexClient,
      loadData("../json/tiers.json"),
      loadData(folderUsagePath + "/formats.json")
    ),
    translations: [
      "abilities",
      "items",
      "moves",
      "natures",
      "pokemons",
      "types",
    ].map(
      (entity) =>
        new ImportTranslations(
          knexClient,
          loadData(`../json/translations/${entity}_translations.json`),
          entity
        )
    ),
    types: new ImportTypes(knexClient, loadData(`../json/types.json`)),
    usages: new ImportUsages(
      knexClient,
      path.resolve(__dirname, folderUsagePath)
    ),
    vgc_usages: new ImportUsagesVGC(
      knexClient,
      path.resolve(__dirname, folderUsagePath)
    ),
  };

  try {
    if (argument === "tags") {
      for (const tagName of [
        "tag",
        "guide_tag",
        "actuality_tag",
        "tournament_tag",
        "video_tag",
      ]) {
        console.log(`Adding / updating ${tagName} tags`);
        await new ImportTags(
          knexClient,
          loadData(`../json/${tagName}s.json`),
          tagName
        );
      }
    } else {
      if (!(argument in scripts))
        throw new Error(`Unknown script value : ${argument}`);

      if (Array.isArray(scripts[argument])) {
        for (const script of scripts[argument]) await script.processImport();
      } else {
        await scripts[argument].processImport();
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await knexClient.destroy();
  }
}
