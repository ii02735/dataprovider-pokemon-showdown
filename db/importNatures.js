const { loadResource, PROVIDER } = require("../libs/fileLoader");
const { insertOrUpdate, knex, resultRecords } = require("./db");
const natures = loadResource(PROVIDER, "natures");

Promise.all(
  insertOrUpdate(knex, "nature", natures, { ignoreColumns: ["usageName"] })
)
  .then((results) => console.log(resultRecords("nature", results)))
  .finally(() => knex.destroy());
