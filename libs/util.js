import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const LAST_GEN = process.env.LAST_GEN;

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
const writeFile = (fileName, values) => fs.writeFile(
    `json/${fileName}.json`,
    JSON.stringify(values),
    e => log(fileName, e)
);

const isStandard = ({ isNonstandard }, gen = null, otherCondition = true) =>
  otherCondition &&
  (!isNonstandard ||
    isNonstandard === "Gigantamax" || // keep Gmax forms
    isNonstandard === "Unobtainable" || // keep Unobtainable real mons
    (gen &&
      gen == LAST_GEN &&
      (isNonstandard === "Past" || isNonstandard === "Future")));
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

const folderUsage = `usages/months/${fs
  .readdirSync(path.resolve("usages/months"))
  .pop()}`;

const withoutSpaces = (s) =>
  s
    .replace(/['\s\-.:’%\[\]]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default {
  writeFile,
  isStandard,
  removeParenthesis,
  LAST_GEN,
  range,
  withoutSpaces,
  folderUsage,
};
