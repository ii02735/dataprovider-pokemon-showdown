import { DataEntityImporter } from "./index.js";

export default class ImportTags extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects, tableName) {
    super(knexClient, arrayOfObjects);
    this.tableName = tableName;
  }

  async processImport() {
    const results = await Promise.all(this.insertOrUpdate(this.tableName));
    console.log(this.getRecordResults(this.tableName, results));
  }
}
