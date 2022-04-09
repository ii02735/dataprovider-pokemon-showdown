const {
  loadResource,
  POKEMON_SHOWDOWN_RESOURCE,
} = require("../libs/fileLoader");

const { Natures } = loadResource(POKEMON_SHOWDOWN_RESOURCE, "natures");

const natures = Object.entries(Natures).map(([key, { name, plus, minus }]) => {
  const nature = { name, usageName: key };
  if (plus) nature[plus] = 1;
  if (minus) nature[minus] = -1;
  return nature;
});

module.exports = natures;
