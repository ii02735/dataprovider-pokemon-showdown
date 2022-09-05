import { DataEntityImporter } from "./index.js";
import { range } from "../libs/util.js";

export class ImportTiers extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects, formats) {
    super(knexClient, arrayOfObjects);
    this.formats = formats;
    // Add tiers for specific gens
    this.arrayOfObjects = this.arrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => "gen" in tier && tier.gen !== "LAST GEN ONLY")
        .flatMap((tier) => {
          if (Array.isArray(tier.gen))
            return tier.gen.map((gen) =>
              Object.assign(Object.assign({}, tier), { gen })
            );
          return [];
        })
    );
    // Add tiers that are played in all gen
    this.arrayOfObjects = this.arrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => !("gen" in tier))
        .flatMap((tier) =>
          range(1, parseInt(process.env.LAST_GEN)).map((gen) =>
            Object.assign(Object.assign({}, tier), { gen })
          )
        )
    );
    // Add tiers that are only played in the last gen
    this.arrayOfObjects = this.arrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => "gen" in tier && tier.gen === "LAST GEN ONLY")
        .map((tier) => {
          tier.gen = parseInt(process.env.LAST_GEN);
          return tier;
        })
    );
  }

  async processImport() {
    let results = await Promise.all(
      this.insertOrUpdate("tier", {
        identifier: "short_name",
        relations: {
          parent_id: { relatedTable: "tier", relatedColumn: "name" },
        },
      })
    );
    console.log(this.getRecordResults("tier", results));
    console.log("Applying right ladderRef for each tier...");
    results = await Promise.all(
      this.arrayOfObjects
        .filter((tier) => tier.usageName)
        .map(this.dataUpdateIteration)
    );

    console.log(this.getRecordResults("tier", results));
  }

  async dataUpdateIteration(tier) {
    let usageNameTierGen = `${tier.gen}${tier.usageName}`;
    if (tier.usageName === "vgc") usageNameTierGen += new Date().getFullYear();
    if (
      usageNameTierGen in this.formats &&
      "dcut" in this.formats[usageNameTierGen]
    ) {
      await this.knexClient("tier")
        .update({ ladder_ref: this.formats[usageNameTierGen].dcut })
        .where({ gen: tier.gen, usage_name: tier.usageName });
      return { INSERTED: 0, UPDATED: 1, tableName: "tier" };
    }
    return { INSERTED: 0, UPDATED: 0, tableName: "tier" };
  }
}
