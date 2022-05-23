const { loadResource, JSON } = require("../libs/fileLoader");
const { insertOrUpdate, knex, resultRecords } = require("./db");
const abilities = loadResource(JSON, "abilities.json").flatMap((ability) =>
  ability.gen.map((gen) => ({ ...ability, gen }))
);

Promise.all(
  insertOrUpdate(knex, "ability", abilities, {
    hasGen: true,
    ignoreColumns: ["shortDescription"],
    replaceColumns: { usageName: "usage_name" },
    noOverrideColumns: ["description"],
  })
)
  .then((results) => console.log(resultRecords("ability", results)))
  .finally(() => knex.destroy());
