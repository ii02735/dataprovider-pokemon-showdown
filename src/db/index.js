import { withoutSpaces } from "../libs/util.js";
import fs from "fs";

class DataImporter {
  /**
   *
   * @param {*} knexClient
   */
  constructor(knexClient) {
    this.knexClient = knexClient;
  }

  /**
   *
   * @return {Promise<void|Error>}
   */
  async processImport() {
    throw new Error("Not yet implemented");
  }
}

export class DataEntityImporter extends DataImporter {
  /**
   * @param {*} knexClient
   * @param {[{}]} arrayOfObjects
   */
  constructor(knexClient, arrayOfObjects) {
    super(knexClient);
    this.arrayOfObjects = arrayOfObjects;
  }

  getRecordResults(table, results) {
    return results.reduce(
      (acc, { INSERTED = 0, UPDATED = 0 }) => {
        acc.INSERTED += INSERTED;
        acc.UPDATED += UPDATED;
        return acc;
      },
      {
        table,
        INSERTED: 0,
        UPDATED: 0,
      }
    );
  }

  insertOrUpdate(
    tableName,
    {
      identifier = null,
      columnsToBeReplaced = [],
      columnsToBeIgnored = [],
      noOverrideColumns = [],
      relations = null,
    }
  ) {
    return this.arrayOfObjects.map(async (entry) => {
      if (columnsToBeIgnored.length > 0) {
        for (const column of columnsToBeIgnored) {
          if (!(column in entry)) continue;
          delete entry[column];
        }
      }

      if (!!columnsToBeReplaced) {
        for (const [oldColumn, newColumn] of Object.entries(
          columnsToBeReplaced
        )) {
          if (!(oldColumn in entry)) continue;
          entry[newColumn] = entry[oldColumn];
          delete entry[oldColumn];
        }
      }

      if (!!relations) {
        for (const [column, { relatedTable, relatedColumn }] of Object.entries(
          relations
        )) {
          if (!(column in entry)) continue;
          let row = null;
          row = await this.knexClient(relatedTable)
            .where({
              [relatedColumn]: entry[column],
              ...("gen" in entry && { gen: entry.gen }),
            })
            .first("id");
          entry[column] = row ? row["id"] : null;
        }
      }

      const identifierRow = identifier
        ? { [identifier]: entry[identifier] }
        : { name: entry["name"] };
      const row = await this.knexClient(tableName)
        .where({ ...identifierRow, ...("gen" in entry && { gen: entry.gen }) })
        .first(["id"]);

      if (!!row && "id" in row) {
        if (noOverrideColumns.length > 0)
          for (const column of noOverrideColumns)
            if (entry[column]) delete entry[column];

        await this.knexClient(tableName).update(entry).where("id", row["id"]);
        return { tableName, INSERTED: 0, UPDATED: 1 };
      }
      await this.knexClient(tableName).insert(entry);
      return { tableName, INSERTED: 1, UPDATED: 0 };
    });
  }

  async findByNameOrByUsageName(tableName, name, gen) {
    let row = await this.knexClient(tableName)
      .where({ name, gen })
      .first(["id"]);
    if (!row) {
      row = await this.knexClient(tableName)
        .where({ usage_name: withoutSpaces(name), gen })
        .first(["id"]);
    }

    row = !!row ? row : false;
    return row;
  }
}

export class DataUsageImporter extends DataImporter {
  /**
   * @param {*} knexClient
   * @param {string} folderUsagePath
   */
  constructor(knexClient, folderUsagePath) {
    super(knexClient);
    this.folderUsagePath = folderUsagePath;
  }

  /**
   * @param {number} gen
   * @param {string} tierUsageName
   * @param {number} ladderRef
   * @return {null|any}
   */
  loadPokedata(gen, tierUsageName, ladderRef) {
    const pokedataFilePath = `${this.folderUsagePath}/formats/gen${
      gen + tierUsageName
    }/${ladderRef}/pokedata.json`;
    if (!fs.existsSync(pokedataFilePath)) {
      console.log(`${pokedataFilePath} doesn't exist...`);
      return null;
    }
    return JSON.parse(fs.readFileSync(pokedataFilePath).toString());
  }
}
