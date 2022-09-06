import cliProgress from "cli-progress";
import bluebird from "bluebird";
import { DataEntityImporter } from "./index.js";

export default class ImportPokemonMoves extends DataEntityImporter {
  constructor(knexClient, arrayOfObjects) {
    super(knexClient, arrayOfObjects);
    this.progressBar = new cliProgress.SingleBar(
      {
        clearOnComplete: true,
        stopOnComplete: true,
      },
      cliProgress.Presets.shades_classic
    );
  }

  async processImport() {
    this.progressBar.start(this.arrayOfObjects.length, 0);
    let results = await bluebird.map(
      this.arrayOfObjects,
      await this.iterateDataInsertion.bind(this),
      { concurrency: 150 }
    );
    console.log(this.getRecordResults("pokemon_move", results));
  }

  async iterateDataInsertion(learn) {
    this.progressBar.increment();
    let INSERTED = 0;
    let pokemonRow = await this.findByNameOrByUsageName(
      "pokemon",
      learn.pokemon,
      learn.gen
    );
    if (!pokemonRow) {
      console.log(
        `Pokémon ${learn.pokemon} en génération ${learn.gen} est introuvable`
      );
      return { tableName: "pokemon_move", INSERTED, UPDATED: 0 };
    }
    let moveIds = []; // will store id moves in order to use for pokemon_move's relation
    for (const move of learn.moves) {
      let moveRow = await this.findByNameOrByUsageName("move", move, learn.gen);
      if (!moveRow) {
        console.log(`Move ${move} en génération ${learn.gen} introuvable`);
        continue;
      }
      moveIds.push(moveRow["id"]);
      try {
        await this.knexClient("pokemon_move").insert({
          pokemon_id: pokemonRow["id"],
          move_id: moveRow["id"],
          gen: learn.gen,
        });
        INSERTED++;
      } catch (e) {
        // Continue loop if the learned move has already been inserted
        if (e.code !== "ER_DUP_ENTRY") throw new Error(e);
      }
    }
    // Delete invalid moves
    await this.knexClient("pokemon_move")
      .whereNotIn("move_id", moveIds)
      .andWhere({
        pokemon_id: pokemonRow["id"],
        gen: learn.gen,
      })
      .delete();
    return { INSERTED, UPDATED: 0, tableName: "pokemon_move" };
  }
}
