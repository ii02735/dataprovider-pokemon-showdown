import { DataEntityImporter } from "./index.js";

export class ImportTypes extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects) {
    super(knexClient, arrayOfObjects);
    this.typeWeaknessesMapping = new Map();
  }

  async processImport() {
    let results = await Promise.all(
      this.arrayOfObjects.map(this.iterateDataTypeInsertion.bind(this))
    );
    console.log(this.getRecordResults("type", results));
    results = await Promise.all(
      Array.from(this.typeWeaknessesMapping).map(
        this.iterateDataWeaknessInsertion.bind(this)
      )
    );
    console.log(this.getRecordResults("weaknesses", results));
  }

  async iterateDataTypeInsertion({ name, gen, weaknesses }) {
    const recordsResults = {
      INSERTED: 0,
      UPDATED: 0,
      tableName: "type",
    };
    const typeRow = await this.knexClient("type")
      .where({ name, gen })
      .first(["id"]);
    let typeId;
    if (!!typeRow) {
      typeId = typeRow["id"];
      await this.knexClient("type").update({ name, gen }).where({ id: typeId });
      recordsResults.UPDATED++;
    } else {
      typeId = await this.knexClient("type").insert({ name, gen }, ["id"]);
      recordsResults.INSERTED++;
    }
    if (weaknesses.length > 0)
      this.typeWeaknessesMapping.set(typeId, weaknesses);
    return recordsResults;
  }

  async iterateDataWeaknessInsertion([id, weaknesses]) {
    let recordsResults = {
      INSERTED: 0,
      UPDATED: 0,
      tableName: "weakness",
    };
    const type = await this.knexClient("type").where({ id }).first();
    for (const weakness of weaknesses) {
      const typeAttackerRow = await this.knexClient("type")
        .where({ name: weakness.name, gen: type.gen })
        .first();
      if (!typeAttackerRow) {
        console.log(`Attacker type ${weakness.name} doesn't exist`);
        continue;
      }
      const existentWeakness = await this.knexClient("weakness")
        .where({
          type_defender_id: type.id,
          type_attacker_id: typeAttackerRow["id"],
          gen: type.gen,
        })
        .first();
      if (!!existentWeakness) continue;
      await this.knexClient("weakness").insert({
        type_defender_id: type.id,
        type_attacker_id: typeAttackerRow["id"],
        gen: type.gen,
        ratio: weakness.ratio,
      });
      recordsResults.INSERTED++;
    }
    return recordsResults;
  }
}
