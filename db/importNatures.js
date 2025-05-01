import { loadResource, JSON as CONST_JSON } from "../libs/fileLoader";
import { insertOrUpdate, knex, resultRecords } from "./db";
const natures = loadResource(CONST_JSON, "natures.json");

Promise.all(
  insertOrUpdate(knex, "nature", natures, { ignoreColumns: ["usageName"] })
)
  .then((results) => console.log(resultRecords("nature", results)))
  .finally(() => knex.destroy());
