import { DataUsageImporter } from "./index.js";
import { LAST_GEN, range } from "../libs/util.js";
export default class ImportUsages extends DataUsageImporter {
  constructor(knexClient, folderUsagePath) {
    super(knexClient, folderUsagePath);
    this.usageDataTableMapping = {
      abilities: "ability",
      items: "item",
      moves: "move",
      teammates: "team_mate",
      counters: "pokemon_check",
    };
    this.percentageProperty = {
      teammates: "usage",
      counters: "eff",
    };
    this.insertedTierUsageIdMapping = {};
    this.pokedataMap = {};
  }

  async processImport() {
    for (const gen of range(1, parseInt(LAST_GEN))) {
      let playableTiers = [];
      const tierRows = await this.knexClient("tier")
        .where({
          gen,
        })
        .whereNot({
          usageName: "vgc",
        })
        .whereNotNull("usage_name")
        .whereNotNull("ladder_ref");
      for (const tierRow of tierRows) playableTiers.push(tierRow);
      // Clear usages
      console.log(`Clearing usages in gen ${gen}...`);
      for (const tier of playableTiers) {
        const rowTierUsages = await this.knexClient("tier_usage").where({
          tier_id: tier.id,
        });
        if (!rowTierUsages) continue;
        for (const rowTierUsage of rowTierUsages)
          await this.knexClient("tier_usage")
            .where({
              id: rowTierUsage.id,
            })
            .del();
        for (const tier of playableTiers) {
          const pokedata = this.loadPokedata(
            gen,
            tier.usageName,
            tier.ladderRef
          );
          if (!pokedata) continue;
          this.pokedataMap.set(gen + tier.usageName + tier.ladderRef, pokedata);
          let rank = 1;
          for (const [pokemonUsageName, usageData] of Object.entries(
            pokedata
          )) {
            const pokemonRow = await this.knexClient("pokemon")
              .select(["id", "name"])
              .where({
                usageName: pokemonUsageName,
                gen,
              })
              .first([]);
            if (!pokemonRow) continue;
            if (usageData.usage < 1) continue;
            const insertedTierRow = await this.knexClient("tier_usage").insert(
              {
                tierId: tier.id,
                pokemonId: pokemonRow.id,
                percent: usageData.usage,
                rank: rank++,
              },
              "id"
            );
            const pokemonByTierId = pokemonRow.usageName + tier.id;
            const pokemonTierData = {
              tierUsageId: insertedTierRow[0],
              pokemon: pokemonRow,
            };

            this.insertedTierUsageIdMapping[pokemonByTierId] = pokemonTierData;
            await this.importEntityData("abilities", pokemonTierData, pokedata);
            await this.importEntityData("items", pokemonTierData, pokedata);
            await this.importEntityData("moves", pokemonTierData, pokedata);
          }
        }
      }
      // Checks and teammates must be inserted after
      // Because these tables ask tier_usage.id.
      // And that's why the insertedTierUsageId object is used
      console.log("Inserting pokemon checks and teammates...");
      for (const tier of playableTiers) {
        if (!(gen + tier.usageName + tier.ladderRef in this.pokedataMap))
          continue;
        const pokedata = this.pokedataMap.get(
          gen + tier.usageName + tier.ladderRef
        );
        for (const [pokemonUsageName] of Object.entries(pokedata)) {
          const pokemonRow = await this.knexClient("pokemon")
            .where({
              usageName: pokemonUsageName,
              gen,
            })
            .first([]);
          if (!pokemonRow) continue;
          const key = pokemonRow.usageName + tier.id;
          // If tier_usage_id couldn't be found, it means that it has been ignored
          // because its usage is less than 1%
          if (!(key in this.insertedTierUsageIdMapping)) continue;
          const pokemonTierData = this.insertedTierUsageIdMapping[key];
          await this.importEntityData("teammates", pokemonTierData, pokedata);
          await this.importEntityData("counters", pokemonTierData, pokedata);
        }
      }
    }
  }

  async importEntityData(property, pokemonTierData, pokedata) {
    const tableName = this.usageDataTableMapping[property];
    const { tierUsageId, pokemon } = pokemonTierData;
    const usageName = pokemon.usageName;
    const entityRow = await this.knexClient(tableName)
      .where({
        usageName,
      })
      .first();

    if (!entityRow) return;

    await this.knexClient(`usage_${tableName}`).insert({
      tierUsageId,
      [`${tableName}_id`]: entityRow.id,
      percent:
        property in this.percentageProperty
          ? pokedata[usageName][property][this.percentageProperty[property]]
          : pokedata[pokemon.usageName][property].usage,
    });
  }
}
