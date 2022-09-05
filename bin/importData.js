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
import knexStringCase from "knex-stringcase";
import fs from "fs";
import path from "path";
import ImportTags from "../src/db/importTags.js";
import { fileURLToPath } from "url";

/**
 * @param {string} argument
 * @return {Promise<void>}
 */
export default async function (argument) {
  const folderUsagePath = "../src/usages";
  const knexClient = knex(
    knexStringCase({
      client: "mysql",
      connection: process.env.CONNECTION_STRING,
      log: {
        warn() {
          // do nothing...it'll hide warning messages
        },
      },
    })
  );

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
    tiers: new ImportTiers(knexClient, loadData("../json/tiers.json")),
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
          loadData(`../json/translations/${entity}_translations.json`, entity)
        )
    ),
    usages: [
      new ImportUsages(knexClient, folderUsagePath),
      new ImportUsagesVGC(knexClient, folderUsagePath),
    ],
  };

  if (argument === "tags") {
    for (const tagName of [
      "tag",
      "guide_tag",
      "actuality_tag",
      "tournament_tag",
      "video_name",
    ])
      await new ImportTags(
        knexClient,
        loadData(`../json/${tagName}s.json`),
        tagName
      );
  } else {
    if (!(argument in scripts))
      throw new Error(`Unknown script value : ${argument}`);

    const callScript = async (key) => {
      if (Array.isArray(scripts[key])) {
        for (const importInstance of scripts[key])
          await importInstance.processImport();
      } else await scripts[key].processImport();
    };

    await callScript(argument);
  }

  await knexClient.destroy();
}
