#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(child_process.exec);
const { updateNodeModulesStructure, updateSrcFiles } = require('./utils');
const colors = require("colors");

const excludeFolders = ["node_modules", "package.json"];

const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {

    let pluginName = CLI_ARGS[1];
    let localFolder = false;

    if(!pluginName.startsWith("@juego")) {
      pluginName = "@juego/" + pluginName.split('/').pop();
      localFolder = true;
    }
    const registryUrl = "https://plugins.juegogames.com/";
    const nodeVersion = process.version.slice(1,3);

    if(CLI_ARGS.length != 0) {

      if(!fs.existsSync(path.resolve(process.cwd(), ".npmrc"))) {
        console.log("Created .npmrc file");
        fs.writeFileSync(path.resolve(process.cwd(), ".npmrc"), `@juego:registry=${registryUrl}`);
      }

      if(fs.existsSync(path.resolve(`./node_modules/${CLI_ARGS[1]}`))) {
        await exec(`npm uninstall ${CLI_ARGS[1]}`, { stdio: 'inherit' });
      }

      console.log(`Installing plugin for node version ${process.versions.node}`.bold.green);

      // install the packages
      await exec(`npm i ${CLI_ARGS[1]}`, { stdio: 'inherit' });

      // Check if compiled version exists for a particular node version
      if(
        !localFolder &&
        !fs.existsSync(path.resolve(`./node_modules/${pluginName}/${nodeVersion}`))
      ) {
        let pluginFolders = await fs.promises.readdir(path.resolve(`./node_modules/${pluginName}`));

        let availableVersions = [];
        pluginFolders.map(folder => {
          if(!excludeFolders.includes(folder)) {
            availableVersions.push(folder + ".x");
          }
        });

        const availableVersionString = availableVersions.join(" | ");

        child_process.execSync(`npm uninstall ${CLI_ARGS[1]}`, { stdio: 'inherit' });
        throw new Error(`
        The Plugin you are trying to install does not exist for the current Node version: ${nodeVersion}!
        Plugin is only Available for following Major versions: ${availableVersionString}
        You can request the Maintianer to update the Plugin or Switch to the Supported Node Versions.
        `.red);
      }

      if(!localFolder) await updateNodeModulesStructure(pluginName);
      await updateSrcFiles(pluginName);

      console.log(`Installation completed!`.bold.green);

    } else {

      console.log(`Installing plugins for node version ${process.versions.node}`.bold.green);

      // Update plugin structure in node_modules
      let packageList = await fs.promises.readdir(path.resolve(`./node_modules/@juego/`));

      await Promise.all(
        packageList.map(async (pluginName) => {
          await updateNodeModulesStructure(`@juego/${pluginName}`);
        })
      );

      console.log(`Installation completed!`.bold.green);

    }

  } catch (e) {
    console.error(colors.red(e));
    process.exit(1);
  }
}

module.exports.execute = execute;