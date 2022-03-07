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
    "doublesou",
  ]) {
    const row = await knex("tier")
      .where({ usage_name, gen })
      .whereNotNull("ladder_ref")
      .first(["id", "ladder_ref"]);
    if (row)
      playableTiers.push({
        id: row.id,
        ladder_ref: row.ladder_ref,
        usage_name,
      });
  }
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
  for (const { ladder_ref, usage_name, id: tier_id } of playableTiers) {
    const pathPokedataFile = `${folderUsage}/formats/gen${
      gen + usage_name
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
        .select(["id"])
        .where({ usage_name: pokemonUsageName, gen, tier_id })
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
        ["moves", "move"],
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
    }
  }
  // Checks and teammates must be inserted after
  // Because these tables ask tier_usage.id.
  // And that's why the insertedTierUsageId object is used
  console.log("Inserting pokemon checks and teammates...");
  for (const { ladder_ref, usage_name, id: tier_id } of playableTiers) {
    const pathPokedataFile = `${folderUsage}/formats/gen${
      gen + usage_name
    }/${ladder_ref}/pokedata.json`;
    console.log(`Loading ${pathPokedataFile}...`);
    if (!fs.existsSync(pathPokedataFile)) {
      console.log(`${pathPokedataFile} doesn't exist : skipping...`);
      continue;
    }
    const pokedata = JSON.parse(
      fs.readFileSync(
        `${folderUsage}/formats/gen${
          gen + usage_name
        }/${ladder_ref}/pokedata.json`
      )
    );
    const percentProperty = { teammates: "usage", counters: "eff" };
    for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
      const pokemonRow = await knex("pokemon")
        .where({ usage_name: pokemonUsageName, gen, tier_id })
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
})().finally(() => knex.destroy());
