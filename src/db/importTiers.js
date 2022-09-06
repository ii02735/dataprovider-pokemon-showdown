import { DataEntityImporter } from "./index.js";
import { LAST_GEN, range } from "../libs/util.js";

export class ImportTiers extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects, formats) {
    super(knexClient, arrayOfObjects);
    this.formats = formats;
    let newArrayOfObjects = [];
    // Add tiers for specific gens
    newArrayOfObjects = newArrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => "gen" in tier && tier.gen !== "LAST GEN ONLY")
        .flatMap((tier) => tier.gen.map((gen) => ({ ...tier, gen })))
    );
    // Add tiers that are played in all gen
    newArrayOfObjects = newArrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => !("gen" in tier))
        .flatMap((tier) =>
          range(1, parseInt(LAST_GEN)).map((gen) => ({ ...tier, gen }))
        )
    );
    // Add tiers that are only played in the last gen
    newArrayOfObjects = newArrayOfObjects.concat(
      this.arrayOfObjects
        .filter((tier) => "gen" in tier && tier.gen === "LAST GEN ONLY")
        .map((tier) => {
          tier.gen = parseInt(LAST_GEN);
          return tier;
        })
    );
    this.arrayOfObjects = newArrayOfObjects;
  }

  async processImport() {
    let results = await Promise.all(
      this.insertOrUpdate("tier", {
        identifier: "shortName",
        columnsToBeReplaced: { parent: "parentId" },
        relations: {
          parentId: { relatedTable: "tier", relatedColumn: "name" },
        },
      })
    );
    console.log(this.getRecordResults("tier", results));
    console.log("Applying right ladderRef for each tier...");
    results = await Promise.all(
      this.arrayOfObjects
        .filter((tier) => tier.usageName)
        .map(this.dataUpdateIteration.bind(this))
    );

    console.log(this.getRecordResults("tier", results));
  }

  async dataUpdateIteration(tier) {
    let usageNameTierGen = `gen${tier.gen}${tier.usageName}`;
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
