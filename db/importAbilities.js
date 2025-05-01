import { loadResource, JSON } from "../libs/fileLoader";
import { insertOrUpdate, knex, resultRecords } from "./db";
const abilities = loadResource(JSON, "abilities.json");

Promise.all(
  insertOrUpdate(knex, "ability", abilities, {
    hasGen: true,
    ignoreColumns: ["shortDescription"],
    noOverrideColumns: ["description"],
  })
)
  .then((results) => console.log(resultRecords("ability", results)))
  .finally(() => knex.destroy());
