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
        let moveIds = [];
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

          moveIds.push(moveRow.id);

          try {
            await knex("pokemon_move").insert({
              pokemon_id: pokemonRow.id,
              move_id: moveRow.id,
              gen: object.gen,
            });
            INSERTED++;
          } catch (e) {
            // Already inserted learn
            if (e.code === "ER_DUP_ENTRY") continue;
            else throw new Error(e);
          }
        }

        // Delete invalid moves
        await knex("pokemon_move")
          .whereNotIn("move_id", moveIds)
          .andWhere({
            pokemon_id: pokemonRow.id,
            gen: object.gen,
          })
          .delete();
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
