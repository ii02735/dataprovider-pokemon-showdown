const { knex } = require("./db");
const pokemonTiers = require("../pokemonTier");
const { withoutSpaces } = require("../util");
const results = { table: "pokemon", UPDATED: 0 };

(async () => {
  try {
    await Promise.all(
      pokemonTiers.map(
        async ({
          pokemon: name,
          tier: short_name = null,
          gen,
          technically,
        }) => {
          let usage_name = null;
          let rowPokemon = await knex("pokemon")
            .where({ name, gen })
            .first(["id"]);
          if (!rowPokemon) {
            usage_name = name;
            rowPokemon = await knex("pokemon")
              .where({ usage_name, gen })
              .first(["id"]);
            if (!rowPokemon) {
              console.log(`Pokémon ${name} introuvable en génération ${gen}`);
              return;
            }
          }
          let rowTier =
            short_name && short_name != "Illegal"
              ? await knex("tier").where({ short_name, gen }).first(["id"])
              : await knex("tier")
                  .where({ name: "Untiered", gen })
                  .first(["id"]);

          if (!rowTier) {
            throw new Error(
              `Pokemon "${name}" in gen ${gen} : Tier ${short_name} cannot be found`
            );
          }

          await knex("pokemon")
            .update({ tier_id: rowTier.id, technically })
            .where({ [usage_name ? "usage_name" : "name"]: name, gen });
          results.UPDATED++;
        }
      )
    );
    console.log(results);
  } catch (err) {
    console.log(err);
  } finally {
    knex.destroy();
  }
})();
