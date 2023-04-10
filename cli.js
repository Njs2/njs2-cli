#!/usr/bin/env node

const { readFileSync } = require("fs")

let CLI_KEYS = {};
let CLI_ARGS = [];

for (let i = 0; i < process.argv.slice(2).length; i++) {
  if (process.argv.slice(2)[i].split("--").length > 1) {
    CLI_KEYS[process.argv.slice(2)[i].split("--")[1]] =
      process.argv.slice(2)[i + 1];
    i++;
  } else {
    CLI_ARGS.push(process.argv.slice(2)[i]);
  }
}

const CMD = CLI_ARGS[0];
CLI_ARGS = CLI_ARGS.slice(1);

switch (CMD) {
  case "project":
    // Create new project
    require("./helper/new-project").execute(CLI_KEYS, CLI_ARGS);
    break;

  case "endpoint":
    // Create new endpoint
    require("./helper/create-endpoint").execute(CLI_KEYS, CLI_ARGS);
    break;

  case "run":
    require("./helper/run").execute(CLI_KEYS, CLI_ARGS);
    break;

  case "plugin":
    // Plugin related actions will be handled here
    require("./helper/plugin-commands").execute(CLI_KEYS, CLI_ARGS);
    break;
  
  // create library files
  case "library":
    require("./helper/create-library").execute(CLI_KEYS, CLI_ARGS);
    break;
  
  case "upgrade":
    require("./helper/upgrade-project").execute(CLI_KEYS, CLI_ARGS);
    break;

  // case "plugin-local":
  //   // Install Locally Developed Private plugins to project
  //   require("./helper/install-plugin-local-testing").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // case "plugin":
  //   // Install plugins to project
  //   require("./helper/install-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // case "rm-plugin":
  //   require("./helper/uninstall-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // case "compile":
  //   // Complie plugins and create build
  //   require("./helper/compile-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // case "compile-all":
  //   // Compile plugins and create build
  //   require("./helper/compile-all-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // create plugin
  // case "create-plugin":
  //   require("./helper/create-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;

  // case "install":
  //   require("./helper/install-private-plugin").execute(CLI_KEYS, CLI_ARGS);
  //   break;
  
  case "help":
    console.log(`
njs2 project <project-name>
njs2 endpoint <endpoint-name>
njs2 run serverless
njs2 run express
njs2 run nodemon
njs2 plugin-local <plugin-name> <plugin-project-path>
njs2 plugin <plugin-name>
njs2 plugin uninstall <plugin-name>
njs2 plugin compile
njs2 plugin install <plugin-name>
njs2 library <folder-name> <filename> <options : [sql,mongo]>
njs2 upgrade [version] [version-number]`);

    break;

  default:
    console.log('CLI Version: ' + JSON.parse(readFileSync('./package.json')).version)
    console.log(`
njs2 project <project-name>
njs2 endpoint <endpoint-name>
njs2 run serverless
njs2 run express
njs2 run nodemon
njs2 plugin-local <plugin-name> <plugin-project-path>
njs2 plugin <plugin-name>
njs2 plugin uninstall <plugin-name>
njs2 plugin compile
njs2 plugin install <plugin-name>
njs2 library <folder-name> <filename> <options : [sql,mongo]>
njs2 upgrade [version] [version-number]`);
    break;
}
