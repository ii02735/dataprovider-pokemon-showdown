const { loadResource, LIBS } = require("../libs/fileLoader");
const { LAST_GEN, folderUsage } = loadResource(LIBS, "util");
const { knex } = require("./db");

const gen = LAST_GEN;
// Choose latest data folder
const fs = require("fs");

(async () => {
  try {
    const VGCRow = await knex("tier")
      .where({ usage_name: "vgc", gen })
      .first(["id", "ladder_ref"]);
    if (!VGCRow) {
      console.log(`The VGC tier for gen ${gen} cannot be found`);
      return;
    }
    const tier_id = VGCRow.id;
    // Clear usages
    console.log(`Clearing old VGC usages...`);
    const rowTierUsages = await knex("tier_usage").where({
      tier_id: VGCRow.id,
    });
    if (!rowTierUsages) {
      console.log("No VGC tier_usages found");
      return;
    }
    for (const rowTierUsage of rowTierUsages)
      await knex("tier_usage").where({ id: rowTierUsage.id }).del();

    // Map between pokemon.id and new inserted tier_usage.id
    let insertedTierUsageId = {};
    const year = folderUsage.split("/").pop().split("-")[0];
    const pathPokedataFile = `${folderUsage}/formats/gen${gen + "vgc" + year}/${
      VGCRow.ladder_ref
    }/pokedata.json`;
    console.log(`Loading ${pathPokedataFile}...`);
    if (!fs.existsSync(pathPokedataFile)) {
      console.log(`${pathPokedataFile} doesn't exist...`);
      return;
    }
    const pokedata = JSON.parse(fs.readFileSync(pathPokedataFile));
    let rank = 1;
    for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
      const pokemonRow = await knex("pokemon")
        .select(["id"])
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
    // Checks and teammates must be inserted after
    // Because these tables ask tier_usage.id.
    // And that's why the insertedTierUsageId object is used
    console.log("Inserting pokemon checks and teammates...");
    const percentProperty = { teammates: "usage", counters: "eff" };
    for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
      const pokemonRow = await knex("pokemon")
        .where({ usage_name: pokemonUsageName, gen })
        .first(["id"]);

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
  } catch (e) {
    console.log(e);
  } finally {
    knex.destroy();
  }
})();
