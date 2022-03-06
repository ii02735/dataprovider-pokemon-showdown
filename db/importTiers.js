const { insertOrUpdate, knex, resultRecords } = require("./db");
const fs = require("fs");
const { folderUsage } = require("../util");
const formats = JSON.parse(fs.readFileSync(folderUsage + "/formats.json"));
const tiers = JSON.parse(fs.readFileSync("json/tiers.json")).flatMap((tier) =>
  tier.gen.map((gen) => ({ ...tier, gen }))
);

Promise.all(
  insertOrUpdate(knex, "tier", tiers, {
    hasGen: true,
    replaceColumns: {
      parent: "parent_id",
      shortName: "short_name",
      usageName: "usage_name",
      ladderRef: "ladder_ref",
      isDouble: "is_double",
      maxPokemon: "max_pokemon",
    },
    ignoreColumns: ["ladder_ref"],
    relations: {
      parent_id: { table: "tier", refColumn: "name" },
    },
  })
)
  .then((results) => console.log(resultRecords("tier", results)))
  .then(() => {
    console.log("Applying right ladderRef for each tier...");
    return Promise.all(
      tiers
        .filter(({ usage_name }) => usage_name)
        .map(async ({ gen, usage_name }) => {
          const usageNameTierGen = "gen" + gen + usage_name;
          if (
            formats.hasOwnProperty(usageNameTierGen) &&
            formats[usageNameTierGen].hasOwnProperty("dcut")
          ) {
            await knex("tier")
              .update({ ladder_ref: formats[usageNameTierGen].dcut })
              .where({ gen, usage_name });
            return { UPDATED: 1 };
          }
          return { UPDATED: 0 };
        })
    );
  })
  .then((results) => console.log(resultRecords("tier", results)))
  .finally(() => knex.destroy());
