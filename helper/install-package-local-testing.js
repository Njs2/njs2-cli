#!/usr/bin/env node
const fs = require("fs");
const child_process = require("child_process");
const path = require('path');

// $ njs2 package-local njs2-firebase-test <path to local plugin project>
const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('Run from project root direcory: njs2 package-local <package-name> <package-path>');

    const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 package-local <package-name> <package-path');
    }

    let folderName = CLI_ARGS[0];

    if (!fs.existsSync('njs2_modules'))
      fs.mkdirSync("njs2_modules");

    if (!fs.existsSync(`njs2_modules/${folderName}`))
      fs.mkdirSync(`njs2_modules/${folderName}`);

    console.log("Copying package contents ...");
    
    child_process.execSync(`cp -r ${CLI_ARGS[1]}/ ./njs2_modules/${folderName}`);

    console.log("Installing package locally ...");
    
    child_process.execSync(`npm i "./njs2_modules/${folderName}"`, { stdio: 'inherit' });
    child_process.execSync(`npm i`, { stdio: 'inherit' });
    // child_process.execSync(`rm "./njs2_modules/${fileName}"`);
    const pluginPackageJson = require(`${path.resolve(process.cwd(), `njs2_modules/${folderName}/package.json`)}`);

    if (pluginPackageJson['njs2-type'] == 'endpoint') {
      await require('./init-package').initPackage(folderName);
    }

    if (pluginPackageJson['loadEnv']) {
      await require('./init-env').initEnv(folderName);
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports.execute = execute;