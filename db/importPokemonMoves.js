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

(async () => {
  try {
    let results = await bluebird.map(
      learns,
      async (object) => {
        progressBar.increment();
        let pokemonRow = await knex("pokemon")
          .where({ name: object.pokemon, gen: object.gen })
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
            return { INSERTED: 0 };
          }
        }

        let moveRow = await knex("move")
          .where({ name: object.move, gen: object.gen })
          .first(["id"]);

        if (!moveRow) {
          moveRow = await knex("move")
            .where({ usage_name: withoutSpaces(object.move), gen: object.gen })
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
    );

    console.log({
      table: "pokemon_move",
      INSERTED: results.reduce((sum, { INSERTED }) => sum + INSERTED, 0),
    });

    let forms = await knex("pokemon")
      .select("id", "base_form_id")
      .whereNotNull("base_form_id");
    progressBar.start(forms.length, 0);
    console.log("Importing learns for special forms...");
    let result = { INSERTED: 0 };
    for (const pokemon of forms) {
      progressBar.increment();
      let learns = await knex("pokemon_move").where({
        pokemon_id: pokemon.base_form_id,
      });

      await bluebird.map(
        learns,
        async (learn) => {
          let existantLearn = await knex("pokemon_move")
            .where({
              pokemon_id: pokemon.id,
              move_id: learn.move_id,
              gen: learn.gen,
            })
            .first(["id"]);
          if (!existantLearn) {
            await knex("pokemon_move").insert({
              pokemon_id: pokemon.id,
              move_id: learn.move_id,
              way: learn.way,
              gen: learn.gen,
            });
            result.INSERTED++;
          }
        },
        { concurrency: 150 }
      );
    }

    console.log({
      table: "pokemon_move (base forms)",
      INSERTED: result.INSERTED,
    });

    forms = await knex("pokemon")
      .select("id", "pre_evo_id")
      .whereNotNull("pre_evo_id");
    console.log("Importing learns for pre evolutions...");
    console.log();

    progressBar.start(forms.length, 0);

    result = { INSERTED: 0 };
    for (const pokemon of forms) {
      progressBar.increment();
      let learns = await knex("pokemon_move").where({
        pokemon_id: pokemon.pre_evo_id,
      });

      await bluebird.map(
        learns,
        async (learn) => {
          let existantLearn = await knex("pokemon_move")
            .where({
              pokemon_id: pokemon.id,
              move_id: learn.move_id,
              gen: learn.gen,
            })
            .first(["id"]);
          if (!existantLearn) {
            await knex("pokemon_move").insert({
              pokemon_id: pokemon.id,
              move_id: learn.move_id,
              way: learn.way,
              gen: learn.gen,
            });
            result.INSERTED++;
          }
        },
        { concurrency: 150 }
      );
    }

    console.log({
      table: "pokemon_move (pre evos)",
      INSERTED: result.INSERTED,
    });
  } catch (err) {
    console.log(err);
  } finally {
    knex.destroy();
  }
})();
