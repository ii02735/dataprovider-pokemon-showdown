const { loadResource, JSON } = require("../libs/fileLoader");
const { knex, insertOrUpdate, resultRecords } = require("./db");
const moves = loadResource(JSON, "moves.json");

Promise.all(
  insertOrUpdate(knex, "move", moves, {
    hasGen: true,
    replaceColumns: {
      type: "type_id",
      usageName: "usage_name",
    },
    ignoreColumns: ["shortDescription"],
    relations: {
      type_id: { table: "type", refColumn: "name" },
    },
    noOverrideColumns: ["description"],
  })
)
  .then((results) => console.log(resultRecords("move", results)))
  .finally(() => knex.destroy());
