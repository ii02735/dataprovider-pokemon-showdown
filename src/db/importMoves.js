import { DataEntityImporter } from "./index.js";
export default class ImportMoves extends DataEntityImporter {
  async processImport() {
    const results = await Promise.all(
      this.insertOrUpdate("move", {
        columnsToBeIgnored: ["shortDescription"],
        columnsToBeReplaced: {
          type: "type_id",
        },
        noOverrideColumns: ["description"],
        relations: {
          type_id: { relatedTable: "type", relatedColumn: "name" },
        },
      })
    );
    console.log(this.getRecordResults("move", results));
  }
}
