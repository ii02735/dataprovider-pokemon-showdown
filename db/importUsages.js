const { LAST_GEN, folderUsage } = require("../util");
const { knex } = require("./db");

process.argv.shift();
process.argv.shift();

const gen = process.argv.shift() || LAST_GEN;

// Choose latest data folder
const fs = require("fs");

(async () => {
  let playableTiers = [];
  for (const usage_name of [
    "ou",
    "ubers",
    "uu",
    "ru",
    "nu",
    "pu",
    "zu",
    "lc",
  ]) {
    const row = await knex("tier")
      .where({ usage_name, gen })
      .first(["id", "ladder_ref"]);
    if (row)
      playableTiers.push({
        id: row.id,
        ladder_ref: row.ladder_ref,
        usage_name,
      });
  }

  // Clear usages
  console.log(`Clearing usages in ${gen}...`);
  for (const { id } of playableTiers) {
    const rowTierUsages = await knex("tier_usage").where({ tier_id: id });
    if (!rowTierUsages) continue;
    for (const rowTierUsage of rowTierUsages) {
      await knex("usage_item").where({ tier_usage_id: rowTierUsage.id }).del();
      await knex("usage_ability")
        .where({ tier_usage_id: rowTierUsage.id })
        .del();
      await knex("usage_move").where({ tier_usage_id: rowTierUsage.id }).del();
      await knex("team_mate").where({ tier_usage_id: rowTierUsage.id }).del();
      await knex("tier_usage").where({ id: rowTierUsage.id }).del();
    }
  }
  // Return only tiers that have a ladder_ref
  playableTiers = playableTiers.filter(({ ladder_ref }) => ladder_ref);

  for (const { ladder_ref, usage_name } of playableTiers) {
    const pokedata = JSON.parse(
      fs.readFileSync(
        `${folderUsage}/formats/gen${
          gen + usage_name
        }/${ladder_ref}/pokedata.json`
      )
    );
    let rank = 1;
    for (const [index, [pokemonUsageName, usageData]] of Object.entries(
      pokedata
    )) {
      console.log(index);
      const pokemonRow = await knex("pokemon")
        .select(["id", "tier_id"])
        .where({ usage_name: pokemonUsageName, gen })
        .first();
      if (!pokemonRow || !pokemonRow.tier_id) continue;
      const insertedTierUsageId = await knex("tier_usage").insert(
        {
          tier_id: pokemonRow.tier_id,
          pokemon_id: pokemonRow.id,
          percent: usageData.usage,
          rank,
          gen,
        },
        "id"
      );
      rank++;
      for (const [property, tableName] of [
        ["abilities", "ability"],
        ["items", "item"],
        ["moves", "move"],
        ["teammates", "team_mate"],
      ]) {
        switch (property) {
          case "teammates":
            for (const entityData of usageData[property]) {
              const entityRow = await knex("pokemon")
                .where({ name: entityData.name, gen })
                .first();
              if (!entityRow) continue;
              await knex(`team_mate`).insert({
                tier_usage_id: insertedTierUsageId[0],
                pokemon_id: entityRow.id,
                percent: entityData.usage,
              });
            }
            break;
          default:
            for (const entityData of usageData[property]) {
              const entityRow = await knex(tableName)
                .where({ name: entityData.name, gen })
                .first();
              if (!entityRow) continue;
              await knex(`usage_${tableName}`).insert({
                tier_usage_id: insertedTierUsageId[0],
                [`${tableName}_id`]: entityRow.id,
                percent: entityData.usage,
              });
            }
        }
      }
    }
  }
})().finally(() => knex.destroy());
