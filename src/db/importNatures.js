import { DataEntityImporter } from "./index.js";
export default class ImportNatures extends DataEntityImporter {
  async processImport() {
    const results = await Promise.all(
      this.insertOrUpdate("nature", {
        columnsToBeIgnored: ["usageName"],
      })
    );
    console.log(this.getRecordResults("nature", results));
  }
}
