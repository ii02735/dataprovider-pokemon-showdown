const { gensByPokemon } = require("./pokemon");
const {
  FormatsData: FormatsDataLastGen,
} = require("./pokemon-showdown/.data-dist/formats-data");
const { PokedexText } = require("./pokemon-showdown/.data-dist/text/pokedex");
const { Pokedex } = require("./pokemon-showdown/.data-dist/pokedex");
const {
  pokemonIsStandard,
  removeParenthesis,
  LAST_GEN,
  getPokemonKeyFromName,
} = require("./util");

/**
 * Forms that appear during battle (for Castform, Euice...)
 * don'h have an assigned tier.
 * To assign one, we must determine their
 * base form one (with the baseForm attribute in Pokedex)
 *
 * @param {string} value the value retrieved from the Pokedex
 * @param {*} formatsData the formatsData where the value is contained
 * @param {boolean} isDoubleTier the desired tier is a double one ?
 */
const determineTierForSpecialForm = (value, formatsData, isDoubleTier) =>
  formatsData[getPokemonKeyFromName(value.baseSpecies)][
    isDoubleTier ? "doublesTier" : "tier"
  ] || null;

let pokemonTier = Object.entries(FormatsDataLastGen)
  .filter(([key, value]) => pokemonIsStandard(value))
  .map(([key, value]) => ({
    pokemon: PokedexText[key] ? PokedexText[key].name : key,
    tier: value.tier ? removeParenthesis(value.tier) : undefined,
    technically: value.tier ? value.tier.startsWith("(") : false,
    doublesTier: value.doublesTier
      ? removeParenthesis(value.doublesTier)
      : undefined,
    gen: LAST_GEN,
  }));

for (let gen = 1; gen < LAST_GEN; gen++) {
  const {
    FormatsData: FormatsDataOldGen,
  } = require(`./pokemon-showdown/.data-dist/mods/gen${gen}/formats-data`);
  pokemonTier = pokemonTier.concat(
    Object.entries(FormatsDataOldGen)
      .filter(([key, value]) => pokemonIsStandard(value))
      .map(([key, value]) => ({
        pokemon: PokedexText[key] ? PokedexText[key].name : key,
        tier: value.tier ? removeParenthesis(value.tier) : undefined,
        technically: value.tier ? value.tier.startsWith("(") : false,
        doublesTier: value.doublesTier
          ? removeParenthesis(value.doublesTier)
          : undefined,
        gen,
      }))
  );
}

// some special pokemon forms are unreferenced into formats-data
// We must retrieve them with their appropriate gens

const absentPokemon = Object.keys(PokedexText)
  .filter((key) => !FormatsDataLastGen[key])
  .map((key) => ({ name: key, gens: gensByPokemon[key] }));

// Then we give them the appropriate tier

for (const { name: key, gens } of absentPokemon) {
  for (const gen of gens) {
    let FormatsData = null;
    if (gen === LAST_GEN) FormatsData = FormatsDataLastGen;
    else FormatsData = FormatsDataOldGen[gen];

    let tier = determineTierForSpecialForm(Pokedex[key], FormatsData);
    let doublesTier = determineTierForSpecialForm(
      Pokedex[key],
      FormatsData,
      true
    );

    if (!tier) continue;

    pokemonTier.push({
      pokemon: PokedexText[key] ? PokedexText[key].name : key,
      tier: removeParenthesis(tier),
      technically: tier.startsWith("("),
      doublesTier: doublesTier ? removeParenthesis(doublesTier) : undefined,
    });
  }
}

module.exports = pokemonTier;
