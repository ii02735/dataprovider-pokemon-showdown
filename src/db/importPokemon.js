import { DataEntityImporter } from "./index.js";

export default class ImportPokemon extends DataEntityImporter {
  async processImport() {
    // For deep array copy
    const originalArray = JSON.stringify(this.arrayOfObjects);
    let results = await Promise.all(
      this.insertOrUpdate("pokemon", {
        columnsToBeReplaced: {
          type_1: "type_1_id",
          type_2: "type_2_id",
          ability_1: "ability_1_id",
          ability_2: "ability_2_id",
          ability_hidden: "ability_hidden_id",
          usageName: "usage_name",
        },
        columnsToBeIgnored: ["baseForm", "prevo"],
        relations: {
          type_1_id: { relatedTable: "type", relatedColumn: "name" },
          type_2_id: { relatedTable: "type", relatedColumn: "name" },
          ability_1_id: { relatedTable: "ability", relatedColumn: "name" },
          ability_2_id: { relatedTable: "ability", relatedColumn: "name" },
          ability_hidden_id: { relatedTable: "ability", relatedColumn: "name" },
        },
      })
    );
    console.log(this.getRecordResults("pokemon", results));
    this.arrayOfObjects = JSON.parse(originalArray);
    results = await Promise.all(
      this.insertOrUpdate("pokemon", {
        columnsToBeReplaced: {
          prevo: "pre_evo_id",
          baseForm: "base_form_id",
        },
        columnsToBeIgnored: [
          "type_1",
          "type_2",
          "ability_1",
          "ability_2",
          "ability_hidden",
          "usageName",
        ],
        relations: {
          base_form_id: { relatedTable: "pokemon", relatedColumn: "name" },
          pre_evo_id: { relatedTable: "pokemon", relatedColumn: "name" },
        },
      })
    );
    console.log(this.getRecordResults("pokemon (forms)", results));
  }
}
