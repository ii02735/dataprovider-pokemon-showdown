import { knex } from "./db";
import { withoutSpaces } from "../libs/util";
import bluebird from "bluebird";
import learns from "../json/learns.json";
import cliProgress from "cli-progress";

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
              usageName: withoutSpaces(object.pokemon),
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
                usageName: withoutSpaces(move),
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
            await knex("pokemonMove").insert({
              pokemonId: pokemonRow.id,
              moveId: moveRow.id,
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
        await knex("pokemonMove")
          .whereNotIn("moveId", moveIds)
          .andWhere({
            pokemonId: pokemonRow.id,
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
      table: "pokemonMove",
      INSERTED: results.reduce((sum, { INSERTED }) => sum + INSERTED, 0),
    });
  } catch (err) {
    console.log(err);
  } finally {
    knex.destroy();
  }
})();
