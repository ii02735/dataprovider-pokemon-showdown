const {
  loadResource,
  LIBS,
  POKEMON_SHOWDOWN_SIMULATOR,
} = require("../libs/fileLoader");
const { LAST_GEN } = loadResource(LIBS, "util");
const { Dex } = loadResource(POKEMON_SHOWDOWN_SIMULATOR, "dex");
let learns = [];

/**
 * TODO
 * For pokemonName / pokemonUsageName, use Dex.mod('genX').species.all() (accept isNonStandard === 'Past' or null)
 * Use Dex.mod('genX').species.getLearnset('pokemonName' / 'pokemonUsageName')
 * Don't forget :
 * Apply inheritance (use object spreading) from prevo and baseform (in case where getLearnset is undefined for special forms)
 */

module.exports = learns;
