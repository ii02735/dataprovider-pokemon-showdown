import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import importData from "./importData.js";
import dataToJson from "./dataToJson.js";

yargs(hideBin(process.argv))
  .command({
    command: "import",
    describe: "Import data",
    builder: {
      entity: {
        demandOption: true,
        type: "string",
        describe: "Name of the entity",
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
          "translations",
          "types",
          "usages",
          "vgc_usages",
        ],
      },
    },
    handler(argv) {
      importData(argv.entity)
        .then()
        .catch((err) => console.error(err));
    },
  })
  .command({
    command: "dataToJson",
    describe: "Generate JSON files from providers",
    handler() {
      dataToJson();
    },
  })

  .parse();
