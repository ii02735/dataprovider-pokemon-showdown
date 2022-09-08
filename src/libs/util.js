import "dotenv/config";
import fileSystem from "fs";

export const LAST_GEN = process.env.LAST_GEN;

const log = (name, e) => {
  if (e) {
    console.error(`Something has gone wrong when creating ${name} :`, e);
  } else {
    console.info(`${name} file created successfully`);
  }
};

export const removeParenthesis = (string) =>
  string.replace(/\(+/g, "").replace(/\)+/g, "");

// prettier-ignore
/**
 *
 * @param {string} fileName
 * @param {Provider} provider
 */
export const writeFile = (fileName, provider) => {

  provider.provideCollection()

  fileSystem.writeFile(
      `json/${fileName}`,
      JSON.stringify(provider.getCollection()),
      e => log(fileName, e)
  );
}

export const isStandard = (
  { isNonstandard },
  gen = null,
  otherCondition = true
) =>
  !!otherCondition &&
  (!isNonstandard ||
    isNonstandard === "Gigantamax" || // keep Gmax forms
    isNonstandard === "Unobtainable" || // keep Unobtainable real mons
    (gen &&
      gen === 8 &&
      (isNonstandard === "Past" || isNonstandard === "Future")));
/**
 * Returns an array of sequential numbers
 * like in python with the native range statement
 * @param {number} start
 * @param {number} end
 * @returns an array of numbers
 */
export const range = (start, end) =>
  Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);

export const withoutSpaces = (s) =>
  s
    .replace(/['\s\-.:’%\[\]]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
