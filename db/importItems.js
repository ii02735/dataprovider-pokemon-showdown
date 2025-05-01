import { loadResource, JSON } from "../libs/fileLoader";
import { insertOrUpdate, knex, resultRecords } from "./db";
const items = loadResource(JSON, "items.json");

Promise.all(
  insertOrUpdate(knex, "item", items, {
    hasGen: true,
    noOverrideColumns: ["description"],
  })
)
  .then((results) => console.log(resultRecords("item", results)))
  .finally(() => knex.destroy());
