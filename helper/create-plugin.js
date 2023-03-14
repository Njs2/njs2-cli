#!/usr/bin/env node
const fs = require('fs-extra');
const childProcess = require('child_process');

module.exports.execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    const PLUGIN_NAME = CLI_ARGS[0];
    // Validations
    if (!PLUGIN_NAME) {
      throw new Error('Package name is mandatory parameter');
    }

    if (fs.existsSync(PLUGIN_NAME)) {
      throw new Error(`Package folder already exists: ${PLUGIN_NAME}`);
    }

    // Create package folder
    fs.mkdirSync(PLUGIN_NAME);
    childProcess.execSync(`mkdir tmp-package && cd ./tmp-package && git clone https://github.com/Njs2/njs2-package-template.git`, { stdio: 'inherit' });
    childProcess.execSync(`cp -r ./tmp-package/njs2-package-template/package/* ${PLUGIN_NAME}`, { stdio: 'inherit' });
    childProcess.execSync(`rm -rf ./tmp-package`, { stdio: 'inherit' });
  } catch (error) {
    console.error(error.message);
  }
};