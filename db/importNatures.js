const { loadResource, JSON } = require("../libs/fileLoader");
const { insertOrUpdate, knex, resultRecords } = require("./db");
const natures = loadResource(JSON, "natures.json");

Promise.all(
  insertOrUpdate(knex, "nature", natures, { ignoreColumns: ["usageName"] })
)
  .then((results) => console.log(resultRecords("nature", results)))
  .finally(() => knex.destroy());
