#!/usr/bin/env node
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error(
        "njs2 library <path> to be run from project root directory"
      );

    const package_json = require(`${path.resolve(
      process.cwd(),
      `package.json`
    )}`);
    if (package_json["njs2-type"] != "project") {
      throw new Error(
        "njs2 library <path> to be run from project root directory"
      );
    }

    let splitString = CLI_ARGS[0].split("/");

    let COPY_TEMP_SCRIPT = "";
    const LIB_NAME = CLI_ARGS[0];
    const LIB_PATH = `src/library/${LIB_NAME}`;
    if (!fs.existsSync(LIB_PATH)) {
      fs.mkdirSync(LIB_PATH);
    }
    const LIB_FILE_NAME = CLI_ARGS[1];
    const LIB_FILE_PATH = `src/library/${LIB_NAME}/${LIB_FILE_NAME}`;
    if (fs.existsSync(LIB_FILE_PATH)) {
      throw new Error(`library file name  already exists: ${LIB_FILE_PATH}`);
    }

    CLI_ARGS[2] = CLI_ARGS[2] == undefined ? "default" : CLI_ARGS[2];

    if (CLI_ARGS[2] === "sql") {
      COPY_TEMP_SCRIPT = `cp -rn "${path.resolve(
        process.cwd(),
        "."
      )}/node_modules/@njs2/base/template/libraryStructure/sql/." "${path.resolve(
        process.cwd(),
        "."
      )}/${LIB_PATH}"`;
    } else if (CLI_ARGS[2] === "mongo") {
      COPY_TEMP_SCRIPT = `cp -rn "${path.resolve(
        process.cwd(),
        "."
      )}/node_modules/@njs2/base/template/libraryStructure/mongo/." "${path.resolve(
        process.cwd(),
        "."
      )}/${LIB_PATH}"`;
    } else {
      COPY_TEMP_SCRIPT = `cp -rn "${path.resolve(
        process.cwd(),
        "."
      )}/node_modules/@njs2/base/template/libraryStructure/default/." "${path.resolve(
        process.cwd(),
        "."
      )}/${LIB_PATH}"`;
    }

    child_process.execSync(COPY_TEMP_SCRIPT);

    fs.renameSync(
      `${path.resolve(
        process.cwd(),
        `src/library/` + CLI_ARGS[0] + `/` + CLI_ARGS[2] + `.lib.js`
      )}`,
      `${path.resolve(
        process.cwd(),
        `src/library/` + CLI_ARGS[0] + `/` + LIB_FILE_NAME + ".js"
      )}`
    );
    let executeFileContents = fs.readFileSync(
      path.resolve(process.cwd(), LIB_PATH + "/" + LIB_FILE_NAME + ".js"),
      "utf8"
    );
    executeFileContents = executeFileContents
      .replace(
        /<class-name>/g,
        LIB_FILE_NAME.charAt(0).toLowerCase() + LIB_FILE_NAME.slice(1)
      )
      .replace(
        /<function-name>/g,
        LIB_FILE_NAME.charAt(0).toUpperCase() + LIB_FILE_NAME.slice(1)
      );
    fs.writeFileSync(
      path.resolve(process.cwd(), `${LIB_PATH}/${LIB_FILE_NAME}.js`),
      executeFileContents
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports.execute = execute;
