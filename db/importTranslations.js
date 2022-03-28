const fileTableMapping = {
  abilities: "ability",
  items: "item",
  moves: "move",
  natures: "nature",
  pokemons: "pokemon",
  types: "type",
};
const { knex } = require("./db");
const fs = require("fs");
//console.log(JSON.parse(fs.readFileSync(`./json/translations/items_translations.json`)))

Promise.all(
  Object.entries(fileTableMapping).flatMap(([file, table]) =>
    Object.entries(
      JSON.parse(
        fs.readFileSync(
          `./json/translations/${file}_translations.json`,
          "utf-8"
        )
      )
    ).map(
      async ([english, french]) =>
        await knex(table).update({ nom: french }).where({ name: english })
    )
  )
)
  .then(() =>
    Promise.all(
      Object.entries(fileTableMapping).flatMap(([file, table]) => {
        if (
          fs.existsSync(
            `./json/translations/descriptions/${file}_translations.json`
          )
        ) {
          return JSON.parse(
            fs.readFileSync(
              `./json/translations/descriptions/${file}_translations.json`,
              "utf-8"
            )
          ).map(
            async ({ name, description, gen }) =>
              await knex(table).update({ description }).where({ name, gen })
          );
        } else {
          return [];
        }
      })
    )
  )
  .catch((err) => console.log(err))
  .finally(() => knex.destroy());
