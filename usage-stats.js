#!/usr/bin/env node
/* stats-updater Main file */

"use strict";

import dotenv from "dotenv";
import Path from "path";
import FileSystem from "fs";
import Program from "commander";

dotenv.config();

import Package from Path.resolve(__dirname, "package.json");

/* Globals */

global.toId = function (str) {
  if (!str) return "";
  return ("" + str).toLowerCase().replace(/[^a-z0-9]/g, "");
};

global.mkdir = function (path) {
  if (!FileSystem.existsSync(path)) {
    try {
      console.log(path);
      FileSystem.mkdirSync(path);
    } catch (err) {
      throw err;
    }
  }
};

if (!Object.merge) {
  Object.merge = function (object, source) {
    if (!object) object = {};
    if (!source) return object;
    for (let key in source) object[key] = source[key];
    return object;
  };
}

if (!Object.values) {
  Object.values = function (object) {
    let values = [];
    for (let key in object) values.push(object[key]);
    return values;
  };
}

mkdir(Path.resolve(__dirname, "usages/"));
mkdir(Path.resolve(__dirname, "usages/months/"));

/* Version and usage */

Program.version(Package.version).usage("[options] <command>");

Program.arguments("<command>").action((command) => {
  let cmds = {
    "update-names": 1,
  };
  if (!(command in cmds)) {
    Program.outputHelp((txt) => txt);
  }
});

Program.option("--clear", "Remove old usage stats files");

/* Commands */

Program.command("update")
  .description("update months list and format names")
  .action(async () => {
    await import(Path.resolve(
      __dirname,
      "stats-updater",
      "update-names.js"
    )).start();
    await import(Path.resolve(
      __dirname,
      "stats-updater",
      "update-months.js"
    )).start();
  });

Program.command("update-names")
  .description("update format names")
  .action(async () => {
    await import(Path.resolve(
      __dirname,
      "stats-updater",
      "update-names.js"
    )).start();
  });

Program.command("update-months")
  .description("update months list")
  .action(async () => {
    await import(Path.resolve(
      __dirname,
      "stats-updater",
      "update-months.js"
    )).start();
  });

Program.command("upgrade <number|all>")
  .description("loads usage stats for last months")
  .action(async (param) => {
    await import(Path.resolve(__dirname, "stats-updater", "upgrade.js")).start(
      param,
      Program.clear
    );
  });

Program.command("get <month>")
  .description("loads usage stats of a month")
  .action(async (month) => {
    await import(Path.resolve(__dirname, "stats-updater", "load-month.js")).start(
      month
    );
  });

Program.command("check")
  .description("checks downloaded stats")
  .action(async () => {
    await import(Path.resolve(__dirname, "stats-updater", "check.js")).start();
  });

Program.command("test <port>")
  .description("creates a http server to test the project")
  .action(async (port) => {
    await import(Path.resolve(__dirname, "server.js")).start(parseInt(port));
  });

Program.command("simple-export <month> <json-formats-file> <output-file>")
  .description("exports a simplified version of usage stats")
  .action(async (month, ff, outFile) => {
    await import(Path.resolve(__dirname, "stats-updater", "export.js")).start(
      month,
      Path.resolve(__dirname, ff),
      Path.resolve(__dirname, outFile)
    );
  });

/* Parse and Start */

Program.parse(process.argv);

if (!process.argv.slice(2).length) {
  Program.outputHelp((txt) => txt);
}
