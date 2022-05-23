const path = require("path");
module.exports.PROVIDER = "PROVIDER";
module.exports.POKEMON_SHOWDOWN_RESOURCE = "POKEMON_SHOWDOWN_RESOURCE";
module.exports.POKEMON_SHOWDOWN_SIMULATOR = "POKEMON_SHOWDOWN_SIMULATOR";
module.exports.LIBS = "LIBS";
module.exports.JSON = "JSON";

module.exports.loadResource = (resourceType, ...pathArray) => {
  switch (resourceType) {
    case this.LIBS:
      return require(path.join(__dirname, "..", "libs", ...pathArray));
    case this.PROVIDER:
      return require(path.join(__dirname, "..", "providers", ...pathArray));
    case this.POKEMON_SHOWDOWN_RESOURCE:
      return require(path.join(
        __dirname,
        "..",
        "pokemon-showdown",
        ".data-dist",
        ...pathArray
      ));
    case this.POKEMON_SHOWDOWN_SIMULATOR:
      return require(path.join(
        __dirname,
        "..",
        "pokemon-showdown",
        ".sim-dist",
        ...pathArray
      ));
    case this.JSON:
      return require(path.join(__dirname, "..", "json", ...pathArray));
  }
};
