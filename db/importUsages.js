const { LAST_GEN, folderUsage, range, withoutSpaces } = require("../util");
const { knex } = require("./db");

// Choose latest data folder
const fs = require("fs");

(async () => {
  try {
    for (const gen of range(1, LAST_GEN)) {
      let playableTiers = [];

      const tiersRows = await knex("tier")
        .where({ gen })
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
        const rowTierUsages = await knex("tier_usage").where({ tier_id: id });
        if (!rowTierUsages) continue;
        for (const rowTierUsage of rowTierUsages)
          await knex("tier_usage").where({ id: rowTierUsage.id }).del();
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
            .where({ usage_name: pokemonUsageName, gen })
            .first();
          if (!pokemonRow) continue;
          const insertedTierRow = await knex("tier_usage").insert(
            {
              tier_id,
              pokemon_id: pokemonRow.id,
              percent: usageData.usage,
              rank: rank++,
            },
            "id"
          );
          insertedTierUsageId[pokemonRow.id] = insertedTierRow[0];
          for (const [property, tableName] of [
            ["abilities", "ability"],
            ["items", "item"],
          ]) {
            for (const entityData of usageData[property]) {
              const entityRow = await knex(tableName)
                .where({ name: entityData.name, gen })
                .first();
              if (!entityRow) continue;
              await knex(`usage_${tableName}`).insert({
                tier_usage_id: insertedTierUsageId[pokemonRow.id],
                [`${tableName}_id`]: entityRow.id,
                percent: entityData.usage,
              });
            }
          }

          // Special case for moves

          for (const entityData of usageData["moves"]) {
            // In stats, the move "Hidden Power" is referenced
            // with its TYPE ("Hidden Power Grass" for example)
            // whereas in database, it is not.
            // We must then insert the move, for the right gen +
            // add to the learns for the concerned pokemon

            if (/Hidden Power (\w+)/.test(entityData.name)) {
              const hiddenPowerRow = await knex("move")
                .where({ name: entityData.name, gen })
                .first();
              let move_id = null;
              if (!hiddenPowerRow) {
                console.log(
                  `${entityData.name} doesn't exist in ${gen} gen : creating move...`
                );
                move_id = await knex("move").insert(
                  {
                    name: entityData.name,
                    usage_name: withoutSpaces(entityData.name),
                    power: 60,
                    pp: 15,
                    accuracy: 100,
                    category: gen > 3 ? "Special" : "Physical",
                    gen,
                  },
                  ["id"]
                );
                move_id = move_id[0];
              } else move_id = hiddenPowerRow.id;

              const existantLearn = await knex("pokemon_move")
                .where({ pokemon_id: pokemonRow.id, move_id, gen })
                .first();

              if (!existantLearn) {
                console.log(
                  `${entityData.name} not in ${pokemonRow.name}'s movepool for ${gen} gen : adding...`
                );
                await knex("pokemon_move").insert({
                  pokemon_id: pokemonRow.id,
                  move_id,
                  gen,
                });
              }
            }

            const entityRow = await knex("move")
              .where({ name: entityData.name, gen })
              .first();
            if (!entityRow) continue;
            await knex(`usage_move`).insert({
              tier_usage_id: insertedTierUsageId[pokemonRow.id],
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
        const percentProperty = { teammates: "usage", counters: "eff" };
        for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
          const pokemonRow = await knex("pokemon")
            .where({ usage_name: pokemonUsageName, gen })
            .first(["id"]);
          if (!pokemonRow) continue;

          /**
           * If the pokemon is not in insertedTierUsageId,
           * It means that the pokemon is not in the pokedata file
           * Example : Ninjask is playable in OU, but its usage stats
           * cannot be found in gen4ou/1630/pokedata.json
           */
          if (!insertedTierUsageId[pokemonRow.id]) continue;
          const tier_usage_id = insertedTierUsageId[pokemonRow.id];
          for (const [property, tableName] of [
            ["teammates", "team_mate"],
            ["counters", "pokemon_check"],
          ]) {
            for (const entityData of usageData[property]) {
              const entityRow = await knex("pokemon")
                .where({ name: entityData.name, gen })
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

const hiddenPowerUpdate = async (pokemonUsageName, moveName, gen) => {};
