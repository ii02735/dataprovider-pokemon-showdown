import { DataEntityImporter } from "./index.js";

export class ImportTranslations extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects, filePrefix) {
    super(knexClient, arrayOfObjects);
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
        async (translation) =>
          await this.knexClient(this.filePrefixTableMapping[this.filePrefix])
            .update({ nom: translation.french })
            .where({ name: translation.english.replace(/[\[\]]/g, "") })
      )
    );
    console.log({
      tableName: this.filePrefixTableMapping[this.filePrefix],
      INSERTED: 0,
      UPDATED: this.arrayOfObjects.length,
    });
  }
}
