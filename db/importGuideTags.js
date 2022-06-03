const { insertOrUpdate, knex, resultRecords } = require("./db");
const { loadResource, JSON } = require("../libs/fileLoader");
const guideTags = loadResource(JSON, "guide_tags.json");

Promise.all(
  insertOrUpdate(knex, "guide_tag", guideTags, {
    replaceColumns: { shortName: "short_name" },
  })
)
  .then((results) => console.log(resultRecords("guide_tag", results)))
  .finally(() => knex.destroy());
