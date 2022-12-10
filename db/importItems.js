const { loadResource, JSON } = require("../libs/fileLoader");
const { insertOrUpdate, knex, resultRecords } = require("./db");
const items = loadResource(JSON, "items.json");

Promise.all(
  insertOrUpdate(knex, "item", items, {
    hasGen: true,
    noOverrideColumns: ["description"],
  })
)
  .then((results) => console.log(resultRecords("item", results)))
  .finally(() => knex.destroy());
