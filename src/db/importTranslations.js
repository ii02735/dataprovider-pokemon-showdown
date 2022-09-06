import { DataEntityImporter } from "./index.js";

export class ImportTranslations extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects, filePrefix) {
    super(knexClient, Object.entries(arrayOfObjects));
    this.filePrefix = filePrefix;
    this.filePrefixTableMapping = {
      abilities: "ability",
      items: "item",
      moves: "move",
      natures: "nature",
      pokemons: "pokemon",
      types: "type",
    };
  }
  async processImport() {
    await Promise.all(
      this.arrayOfObjects.map(
        async ([english, french]) =>
          await this.knexClient(this.filePrefixTableMapping[this.filePrefix])
            .update({ nom: french })
            .where({ name: english.replace(/[\[\]]/g, "") })
      )
    );
    console.log({
      tableName: this.filePrefixTableMapping[this.filePrefix],
      INSERTED: 0,
      UPDATED: this.arrayOfObjects.length,
    });
  }
}
