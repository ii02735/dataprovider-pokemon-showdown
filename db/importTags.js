const { insertOrUpdate, knex, resultRecords } = require("./db");
const { loadResource, JSON } = require("../libs/fileLoader");
const tags = loadResource(JSON, "tags.json");

Promise.all(
  insertOrUpdate(knex, "tag", tags, {
    replaceColumns: { shortName: "short_name" },
  })
)
  .then((results) => console.log(resultRecords("tag", results)))
  .finally(() => knex.destroy());
