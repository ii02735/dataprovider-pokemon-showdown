const { loadResource } = require("./fileLoader");
const fileSystem = require("fs");

const LAST_GEN = 8;

const log = (name, e) => {
  if (e) {
    console.error(`Erreur lors de la création du  fichier ${name}.json :`, e);
  } else {
    console.info(`Création du fichier ${name}.json réussi`);
  }
};

const removeParenthesis = (string) =>
  string.replace(/\(+/g, "").replace(/\)+/g, "");

// prettier-ignore
const writeFile = (fileName, values) => fileSystem.writeFile(
    `json/${fileName}.json`,
    JSON.stringify(values),
    e => log(fileName, e)
);

const isStandard = ({ isNonstandard }, gen = null) =>
  !isNonstandard ||
  isNonstandard === "Gigantamax" || // keep Gmax forms
  isNonstandard === "Unobtainable" || // keep Unobtainable real mons
  (gen &&
    gen === 8 &&
    (isNonstandard === "Past" || isNonstandard === "Future"));
/**
 * Returns an array of sequential numbers
 * like in python with the native range statement
 * @param {number} start
 * @param {number} end
 * @returns an array of numbers
 */
const range = (start, end) =>
  Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);

const folderUsage = `usages/months/${fileSystem
  .readdirSync(require("path").resolve("usages/months"))
  .pop()}`;

const withoutSpaces = (s) =>
  s
    .replace(/['\s\-.:’%\[\]]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

module.exports = {
  writeFile,
  isStandard,
  removeParenthesis,
  LAST_GEN,
  range,
  withoutSpaces,
  folderUsage,
};
