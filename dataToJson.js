// TODO retirer la fin des pokemons missingno + CAP + pokemon studio
"use strict";

const { writeFile } = require("./util");

const abilities = require("./abilities");
const items = require("./items");
const learns = require("./learns");
const moves = require("./moves");
const natures = require("./natures");
const pokemons = require("./pokemon");
const pokemonTier = require("./pokemonTier");
const types = require("./types");

writeFile("abilities", abilities);

writeFile("pokemons", pokemons);

writeFile("items", items);

writeFile("types", types);

writeFile("moves", moves);

writeFile("learns", learns);

writeFile("natures", natures);

writeFile("pokemonTier", pokemonTier);
