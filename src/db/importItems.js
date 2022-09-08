import { DataEntityImporter } from "./index.js";

export default class ImportItems extends DataEntityImporter {
  async processImport() {
    const results = await Promise.all(
      this.insertOrUpdate("item", {
        noOverrideColumns: ["description"],
      })
    );
    console.log(this.getRecordResults("items", results));
  }
}
