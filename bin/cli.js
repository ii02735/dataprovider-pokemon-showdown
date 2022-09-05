import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import importData from "./importData.js";
import dataToJson from "./dataToJson.js";

yargs(hideBin(process.argv))
  .command({
    command: "import",
    describe: "Import data",
    builder: {
      script: {
        demandOption: true,
        type: "string",
        describe: "Name of the importer to execute",
        choices: [
          "abilities",
          "items",
          "learns",
          "moves",
          "natures",
          "pokemon",
          "pokemonTier",
          "tags",
          "tiers",
          "types",
          "usages",
        ],
      },
    },
    handler(argv) {
      importData(argv.script)
        .then()
        .catch((err) => console.error(err));
    },
  })
  .command({
    command: "dataToJson",
    describe: "Generate JSON files from providers",
    handler(argv) {
      dataToJson();
    },
  })

  .parse();
