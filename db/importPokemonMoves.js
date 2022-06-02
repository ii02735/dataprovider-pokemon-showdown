const { loadResource, LIBS, JSON } = require("../libs/fileLoader");
const { knex } = require("./db");
const { withoutSpaces } = loadResource(LIBS, "util");
const bluebird = require("bluebird");
const learns = loadResource(JSON, "learns.json");
const cliProgress = require("cli-progress");
const progressBar = new cliProgress.SingleBar(
  {
    clearOnComplete: true,
    stopOnComplete: true,
  },
  cliProgress.Presets.shades_classic
);
progressBar.start(learns.length, 0);

(async () => {
  try {
    let results = await bluebird.map(
      learns,
      async (object) => {
        progressBar.increment();
        let pokemonRow = await knex("pokemon")
          .where({
            name: object.pokemon,
            gen: object.gen,
          })
          .first(["id"]);
        if (!pokemonRow) {
          pokemonRow = await knex("pokemon")
            .where({
              usage_name: withoutSpaces(object.pokemon),
              gen: object.gen,
            })
            .first(["id"]);
          if (!pokemonRow) {
            console.log(
              `Pokémon ${object.pokemon} en génération ${object.gen} introuvable`
            );
            return {
              INSERTED: 0,
            };
          }
        }
        let INSERTED = 0;
        for (const move of object.moves) {
          let moveRow = await knex("move")
            .where({
              name: move,
              gen: object.gen,
            })
            .first(["id"]);

          if (!moveRow) {
            moveRow = await knex("move")
              .where({
                usage_name: withoutSpaces(move),
                gen: object.gen,
              })
              .first(["id"]);
            if (!moveRow) {
              console.log(
                `Move ${move} en génération ${object.gen} introuvable`
              );
              continue;
            }
          }

          const samePokemonMoveRow = await knex("pokemon_move")
            .where({
              pokemon_id: pokemonRow.id,
              move_id: moveRow.id,
            })
            .first(["id"]);
          if (samePokemonMoveRow) continue;

          await knex("pokemon_move").insert({
            pokemon_id: pokemonRow.id,
            move_id: moveRow.id,
            gen: object.gen,
          });
          INSERTED++;
        }
        return {
          INSERTED,
        };
      },
      {
        concurrency: 150,
      }
    );

    console.log({
      table: "pokemon_move",
      INSERTED: results.reduce((sum, { INSERTED }) => sum + INSERTED, 0),
    });
  } catch (err) {
    console.log(err);
  } finally {
    knex.destroy();
  }
})();
