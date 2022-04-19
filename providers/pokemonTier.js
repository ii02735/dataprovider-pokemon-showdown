const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_RESOURCE,
  PROVIDER,
} = require("../libs/fileLoader");
const { gensByPokemon } = loadResource(PROVIDER, "pokemon");
const { FormatsData: FormatsDataLastGen } = loadResource(
  POKEMON_SHOWDOWN_RESOURCE,
  "formats-data"
);
const { PokedexText } = loadResource(
  POKEMON_SHOWDOWN_RESOURCE,
  "text",
  "pokedex"
);
const { Pokedex } = loadResource(POKEMON_SHOWDOWN_RESOURCE, "pokedex");
const {
  pokemonIsStandard,
  removeParenthesis,
  LAST_GEN,
  getPokemonKeyFromName,
} = loadResource(LIBS, "util");

/**
 * Forms that appear during battle (for Castform, Euice...)
 * don't have an assigned tier.
 * To assign one, we must determine their
 * base form one (with the baseForm attribute in Pokedex)
 *
 * @param {string} value the value retrieved from the Pokedex
 * @param {*} formatsData the formatsData where the value is contained
 * @param {boolean} isDoubleTier the desired tier is a double one ?
 */
const determineTierForSpecialForm = (value, formatsData, isDoubleTier) =>
  // Priorize form that is enabled in battle first (battleOnly attribute)
  // If not defined, fetch baseForm (baseSpecies) data
  value.battleOnly
    ? formatsData[getPokemonKeyFromName(value.battleOnly)][
        isDoubleTier ? "doublesTier" : "tier"
      ]
    : formatsData[getPokemonKeyFromName(value.baseSpecies)][
        isDoubleTier ? "doublesTier" : "tier"
      ] || null;

let pokemonTier = Object.entries(FormatsDataLastGen)
  .filter(([key, value]) => pokemonIsStandard(value))
  .map(([key, value]) => {
    const doublesTier = value.doublesTier
      ? removeParenthesis(value.doublesTier)
      : undefined;
    return {
      pokemon: PokedexText[key] ? PokedexText[key].name : key,
      tier: value.tier
        ? removeParenthesis(value.tier)
        : determineTierForSpecialForm(
            Pokedex[key],
            FormatsDataLastGen,
            doublesTier
          ),
      technically: value.tier ? value.tier.startsWith("(") : false,
      doublesTier,
      gen: LAST_GEN,
    };
  });

for (let gen = 1; gen < LAST_GEN; gen++) {
  const { FormatsData: FormatsDataOldGen } = loadResource(
    POKEMON_SHOWDOWN_RESOURCE,
    "mods",
    `gen${gen}`,
    "formats-data"
  );
  pokemonTier = pokemonTier.concat(
    Object.entries(FormatsDataOldGen)
      .filter(([key, value]) => pokemonIsStandard(value))
      .map(([key, value]) => {
        const doublesTier = value.doublesTier
          ? removeParenthesis(value.doublesTier)
          : undefined;
        return {
          pokemon: PokedexText[key] ? PokedexText[key].name : key,
          tier: value.tier
            ? removeParenthesis(value.tier)
            : determineTierForSpecialForm(
                Pokedex[key],
                FormatsDataLastGen,
                doublesTier
              ),
          technically: value.tier ? value.tier.startsWith("(") : false,
          doublesTier,
          gen,
        };
      })
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
      gen,
    });
  }
}

module.exports = pokemonTier;
