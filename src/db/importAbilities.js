import { DataEntityImporter } from "./index.js";

export default class ImportAbilities extends DataEntityImporter {
  async processImport() {
    const results = await Promise.all(
      this.insertOrUpdate("ability", {
        columnsToBeIgnored: ["shortDescription"],
        noOverrideColumns: ["description"],
      })
    );

    console.log(this.getRecordResults("ability", results));
  }
}
