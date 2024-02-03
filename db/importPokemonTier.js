const { loadResource, JSON, LIBS } = require("../libs/fileLoader");
const { knex } = require("./db");
const pokemonTiers = loadResource(JSON, "pokemonTier.json");
const { removeParenthesis } = loadResource(LIBS, "util");
const results = { table: "pokemon", UPDATED: 0 };

const cathError = (err, resolve) => {
  console.error(err);
  resolve();
};

Promise.all(
  pokemonTiers.map(
    ({ pokemon: name, tier: short_name, gen, technically }, i) => {
      return new Promise((resolve, reject) => {
        knex("pokemon")
          .where(function () {
            // lambda function to use "this" in knex
            this.where({ name }).orWhere({ usage_name: name });
          })
          .andWhere({ gen })
          .first(["id", "usage_name"])
          .then((rowPokemon) => {
            if (!rowPokemon) {
              cathError(
                new Error(`Pokemon "${name}" in gen ${gen} cannot be found`),
                resolve
              );
            }

            short_name = removeParenthesis(short_name);
            if (short_name === "Illegal" || short_name === "Unreleased") {
              short_name = null;
            }
            knex("tier")
              .where(
                short_name ? { short_name, gen } : { name: "Untiered", gen }
              )
              .first(["id", "name"])
              .then((rowTier) => {
                if (!rowTier) {
                  cathError(
                    Error(
                      `Pokemon "${name}" in gen ${gen} : Tier ${short_name} cannot be found`
                    ),
                    resolve
                  );
                }

                knex("pokemon")
                  .update({ tierId: rowTier.id, technically })
                  .where({ id: rowPokemon.id, gen })
                  .then(() => {
                    results.UPDATED++;
                    resolve();
                  })
                  .catch((e) => cathError(e, resolve));
              })
              .catch((e) => cathError(e, resolve));
          })
          .catch((e) => cathError(e, resolve));
      });
    }
  )
)
  .then(() => {
    console.log(results);
  })
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    knex.destroy();
  });
