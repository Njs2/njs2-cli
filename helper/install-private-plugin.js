#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(child_process.exec);
const { updateNodeModulesStructure, updateSrcFiles } = require('./utils');

const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {

    let pluginName = CLI_ARGS[0];
    const nodeVersion = process.version.slice(1,3);

    if(CLI_ARGS.length != 0) {

      const rcFileExists = fs.existsSync(path.resolve(process.cwd(), ".npmrc"));

      if(!rcFileExists) {
        console.log("Created .npmrc file");
        fs.writeFileSync(path.resolve(process.cwd(), ".npmrc"), "@juego:registry=http://localhost:8000/");
      }

      if(fs.existsSync(path.resolve(process.cwd(), `node_modules/${CLI_ARGS[0]}`))) {
        await exec(`npm uninstall ${CLI_ARGS[0]}`, { stdio: 'inherit' });
      }

      // install the packages
      await exec(`npm i ${CLI_ARGS[0]}`, { stdio: 'inherit' });

      // Check if compiled version exists for a particular node version
      if(!fs.existsSync(path.resolve(process.cwd(), `node_modules/${pluginName}/${nodeVersion}`))) {
        let files = await fs.promises.readdir(path.resolve(process.cwd(), `node_modules/${pluginName}`));
        console.log({files});
        // child_process.execSync(`npm uninstall ${CLI_ARGS[0]}`, { stdio: 'inherit' });
        throw new Error(`Package does not exist for node version ${nodeVersion}. Please try installing again or install with other node version!`);
      }

      await updateNodeModulesStructure(pluginName);
      await updateSrcFiles(pluginName);

          
      if(!rcFileExists) {
        console.log("removed .npmrc file");
        child_process.execSync(`rm -rf ${path.resolve(process.cwd(), ".npmrc")}`);
      }
      
    } else {
      child_process.execSync(`npm i`, { stdio: 'inherit' });

      let packageList = await fs.promises.readdir(path.resolve(process.cwd(), `node_modules/@juego/`));

      await Promise.all(
        packageList.map(async (pluginName) => {
          await updateNodeModulesStructure(`@juego/${pluginName}`);
        })
      );

    }

    return;

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports.execute = execute;