const { loadResource, LIBS } = require("../libs/fileLoader");
const { LAST_GEN, folderUsage, range, withoutSpaces } = loadResource(
  LIBS,
  "util"
);
const { knex } = require("./db");

// Choose latest data folder
const fs = require("fs");

(async () => {
  try {
    for (const gen of range(1, LAST_GEN)) {
      let playableTiers = [];

      const tiersRows = await knex("tier")
        .where({
          gen,
        })
        .whereNot({
          usage_name: "vgc",
        })
        .whereNotNull("usage_name")
        .whereNotNull("ladder_ref");

      for (const tierRow of tiersRows)
        playableTiers.push({
          id: tierRow.id,
          ladder_ref: tierRow.ladder_ref,
          usage_name: tierRow.usage_name,
        });

      // Clear usages
      console.log(`Clearing usages in gen ${gen}...`);
      for (const { id } of playableTiers) {
        const rowTierUsages = await knex("tier_usage").where({
          tier_id: id,
        });
        if (!rowTierUsages) continue;
        for (const rowTierUsage of rowTierUsages)
          await knex("tier_usage")
            .where({
              id: rowTierUsage.id,
            })
            .del();
      }

      // Map between pokemon.id and new inserted tier_usage.id
      let insertedTierUsageId = {};
      for (const {
        ladder_ref,
        usage_name: tier_usage_name,
        id: tier_id,
      } of playableTiers) {
        const pathPokedataFile = `${folderUsage}/formats/gen${
          gen + tier_usage_name
        }/${ladder_ref}/pokedata.json`;
        console.log(`Loading ${pathPokedataFile}...`);
        if (!fs.existsSync(pathPokedataFile)) {
          console.log(`${pathPokedataFile} doesn't exist : skipping...`);
          continue;
        }
        const pokedata = JSON.parse(fs.readFileSync(pathPokedataFile));
        let rank = 1;
        for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
          const pokemonRow = await knex("pokemon")
            .select(["id", "name"])
            .where({
              usage_name: pokemonUsageName,
              gen,
            })
            .first();
          if (!pokemonRow) continue;
          if (usageData.usage < 1) continue;
          const insertedTierRow = await knex("tier_usage").insert(
            {
              tier_id,
              pokemon_id: pokemonRow.id,
              percent: usageData.usage,
              rank: rank++,
            },
            "id"
          );
          insertedTierUsageId[pokemonUsageName + tier_id] = insertedTierRow[0];
          for (const [property, tableName] of [
            ["abilities", "ability"],
            ["items", "item"],
          ]) {
            for (const entityData of usageData[property]) {
              const entityRow = await knex(tableName)
                .where({
                  usage_name: withoutSpaces(entityData.name),
                  gen,
                })
                .first();
              if (!entityRow) continue;
              await knex(`usage_${tableName}`).insert({
                tier_usage_id: insertedTierUsageId[pokemonUsageName + tier_id],
                [`${tableName}_id`]: entityRow.id,
                percent: entityData.usage,
              });
            }
          }

          // Special case for moves

          for (const entityData of usageData["moves"]) {
            const entityRow = await knex("move")
              .where({
                usage_name: withoutSpaces(entityData.name),
                gen,
              })
              .first();
            if (!entityRow) continue;
            await knex(`usage_move`).insert({
              tier_usage_id: insertedTierUsageId[pokemonUsageName + tier_id],
              [`move_id`]: entityRow.id,
              percent: entityData.usage,
            });
          }
        }
      }
      // Checks and teammates must be inserted after
      // Because these tables ask tier_usage.id.
      // And that's why the insertedTierUsageId object is used
      console.log("Inserting pokemon checks and teammates...");
      for (const {
        ladder_ref,
        usage_name: tier_usage_name,
        id: tier_id,
      } of playableTiers) {
        const pathPokedataFile = `${folderUsage}/formats/gen${
          gen + tier_usage_name
        }/${ladder_ref}/pokedata.json`;
        console.log(`Loading ${pathPokedataFile}...`);
        if (!fs.existsSync(pathPokedataFile)) {
          console.log(`${pathPokedataFile} doesn't exist : skipping...`);
          continue;
        }
        const pokedata = JSON.parse(
          fs.readFileSync(
            `${folderUsage}/formats/gen${
              gen + tier_usage_name
            }/${ladder_ref}/pokedata.json`
          )
        );
        const percentProperty = {
          teammates: "usage",
          counters: "eff",
        };
        for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
          const pokemonRow = await knex("pokemon")
            .where({
              usage_name: pokemonUsageName,
              gen,
            })
            .first(["id"]);
          if (!pokemonRow) continue;

          // If tier_usage_id couldn't be found, it means that it has been ignored
          // because its usage is less than 1%
          if (!insertedTierUsageId[pokemonUsageName + tier_id]) continue;
          const tier_usage_id = insertedTierUsageId[pokemonUsageName + tier_id];
          for (const [property, tableName] of [
            ["teammates", "team_mate"],
            ["counters", "pokemon_check"],
          ]) {
            for (const entityData of usageData[property]) {
              const entityRow = await knex("pokemon")
                .where({
                  usage_name: withoutSpaces(entityData.name),
                  gen,
                })
                .first();

              if (!entityRow) continue;
              await knex(tableName).insert({
                tier_usage_id,
                pokemon_id: entityRow.id,
                percent: entityData[percentProperty[property]],
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    knex.destroy();
  }
})();
