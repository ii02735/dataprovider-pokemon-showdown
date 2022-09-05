import { DataEntityImporter } from "./index.js";
import { removeParenthesis } from "../libs/util.js";

export default class ImportPokemonTier extends DataEntityImporter {
  async processImport() {
    const results = await Promise.all(
      this.arrayOfObjects.map(this.iterateDataInsertion)
    );
    console.log(this.getRecordResults("pokemon", results));
  }

  async iterateDataInsertion(pokemonTier) {
    const rowPokemon = this.findByNameOrByUsageName(
      "pokemon",
      pokemonTier.pokemon,
      pokemonTier.gen
    );
    if (!rowPokemon) {
      console.log(
        `Pokémon ${pokemonTier.pokemon} introuvable en génération ${pokemonTier.gen}`
      );
      return;
    }

    const rowTier =
      "shortName" in pokemonTier && pokemonTier.tier != "Illegal"
        ? await this.knexClient("tier")
            .where({
              short_name: removeParenthesis(pokemonTier.tier),
              gen: pokemonTier.gen,
            })
            .first(["id"])
        : await this.knexClient("tier")
            .where({ name: "Untiered", gen: pokemonTier.gen })
            .first(["id"]);

    if (!rowTier) {
      throw new Error(
        `Pokemon "${pokemonTier.pokemon}" in gen ${pokemonTier.gen} : Tier ${pokemonTier.tier} cannot be found`
      );
    }

    await this.knexClient("pokemon")
      .update({ tier_id: rowTier["id"], technically: pokemonTier.technically })
      .where({
        usage_name: removeParenthesis(pokemonTier.pokemon),
        gen: pokemonTier.gen,
      });
    return { tableName: "pokemon", INSERTED: 0, UPDATED: 1 };
  }
}
