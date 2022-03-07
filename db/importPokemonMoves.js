const { knex } = require("./db");
const { withoutSpaces } = require("../util");
const bluebird = require("bluebird");
const learns = require("../learns").flatMap((learn) =>
  learn.gen.map((gen) => ({ ...learn, gen }))
);
const cliProgress = require("cli-progress");
const progressBar = new cliProgress.SingleBar(
  { clearOnComplete: true, stopOnComplete: true },
  cliProgress.Presets.shades_classic
);
progressBar.start(learns.length, 0);

bluebird
  .map(
    learns,
    async (object) => {
      progressBar.increment();
      let pokemonRow = await knex("pokemon")
        .where({ name: object.pokemon, gen: object.gen })
        .first(["id"]);
      if (!pokemonRow) {
        pokemonRow = await knex("pokemon")
          .where({ name: withoutSpaces(object.pokemon), gen: object.gen })
          .first(["id"]);
        if (!pokemonRow) {
          console.log(
            `Pokémon ${object.pokemon} en génération ${object.gen} introuvable`
          );
          return { INSERTED: 0 };
        }
      }

      let moveRow = await knex("move")
        .where({ name: object.move, gen: object.gen })
        .first(["id"]);

      if (!moveRow) {
        moveRow = await knex("move")
          .where({ name: withoutSpaces(object.move), gen: object.gen })
          .first(["id"]);
        if (!moveRow) {
          console.log(
            `Move ${object.move} en génération ${object.gen} introuvable`
          );
          return { INSERTED: 0 };
        }
      }

      const samePokemonMoveRow = await knex("pokemon_move")
        .where({ pokemon_id: pokemonRow.id, move_id: moveRow.id })
        .first(["id"]);
      if (samePokemonMoveRow) return { INSERTED: 0 };

      await knex("pokemon_move").insert({
        pokemon_id: pokemonRow.id,
        move_id: moveRow.id,
        gen: object.gen,
      });
      return { INSERTED: 1 };
    },
    { concurrency: 150 }
  )
  .then((results) => {
    console.log({
      table: "pokemon_move",
      INSERTED: results.reduce((sum, { INSERTED }) => sum + INSERTED, 0),
    });
  })
  .catch((err) => console.log(err))
  .finally(() => knex.destroy());
