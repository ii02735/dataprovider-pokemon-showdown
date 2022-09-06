import ImportUsages from "./importUsages.js";
import { LAST_GEN } from "../libs/util.js";

export default class ImportUsagesVGC extends ImportUsages {
  async processImport() {
    const gen = parseInt(LAST_GEN);
    const VGCRow = await this.knexClient("tier")
      .where({
        usageName: "vgc",
        gen,
      })
      .whereNotNull("usage_name")
      .whereNotNull("ladder_ref")
      .first();
    if (!VGCRow) throw new Error(`The VGC tier for ${gen} cannot be found`);
    // Clear usages
    console.log(`Clearing old VGC usages...`);
    const rowTierUsages = await this.knexClient("tier_usage").where({
      tier_id: VGCRow.id,
    });

    if (!rowTierUsages) throw new Error("No VGC tier usages found");

    for (const rowTierUsage of rowTierUsages)
      await this.knexClient("tier_usage").where({ id: rowTierUsage.id }).del();

    const pokedata = this.loadPokedata(
      gen,
      "vgc" + new Date().getFullYear(),
      VGCRow.ladderRef
    );

    if (!pokedata)
      throw new Error("Data regarding VGC usage couldn't be retrieved");

    console.log(`Loading usages for VGC...`);
    let rank = 1;
    for (const [pokemonUsageName, usageData] of Object.entries(pokedata)) {
      const pokemonRow = await this.knexClient("pokemon")
        .where({
          usageName: pokemonUsageName,
          gen,
        })
        .first([]);

      if (!pokemonRow) continue;

      if (usageData.usage < 1) continue;

      const insertedTierRow = await this.knexClient("tier_usage").insert(
        {
          tierId: VGCRow.id,
          pokemonId: pokemonRow.id,
          percent: usageData.usage,
          rank: rank++,
        },
        "id"
      );
      // No need to create specific key, because there is only one tier : the VGC
      const key = pokemonRow.id.toString();
      this.insertedTierUsageIdMapping[key] = insertedTierRow[0];
      const pokemonTierData = {
        tierUsageId: insertedTierRow[0],
        pokemon: pokemonRow,
      };
      await this.importUsageData("abilities", pokemonTierData, pokedata);
      await this.importUsageData("items", pokemonTierData, pokedata);
      await this.importUsageData("moves", pokemonTierData, pokedata);
      await this.importUsageData("teammates", pokemonTierData, pokedata);
      await this.importUsageData("counters", pokemonTierData, pokedata);
    }
  }
}
