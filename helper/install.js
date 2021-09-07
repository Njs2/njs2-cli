#!/usr/bin/env node
const fs = require("fs");
const child_process = require("child_process");
const path = require('path');

const install = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('Run from project root direcory: njs2 plugin <package-name> (Eg: @njs2/sql@latest)');

    const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 plugin <package-name> (Eg: njs2 plugin @njs2/sql@latest)');
    }

    let packageName = CLI_ARGS[0];
    if (!packageName || packageName.length == 0) {
      throw new Error('Invalid package-name: njs2 plugin <package-name> (Eg: njs2 plugin @njs2/sql@latest)');
    }

    child_process.execSync(`npm i ${packageName} `, { stdio: 'inherit' });
    const packageNameWithoutVersion = packageName.indexOf('@') == 0 ? packageName.slice(1).split('@')[0] : packageName.split('@')[0];
    const resPackageName = packageName.indexOf('@') == 0 ? `@${packageNameWithoutVersion}` : packageNameWithoutVersion;
    const pluginPackageJson = require(`${path.resolve(process.cwd(), `node_modules/${resPackageName}/package.json`)}`);

    if (pluginPackageJson['loadEnv']) {
      require('./init-env').initEnv(resPackageName);
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports.install = install;