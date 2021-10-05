#!/usr/bin/env node
const fs = require('fs-extra');
const childProcess = require('child_process');

module.exports.execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    const PACKAGE_NAME = CLI_ARGS[0];
    // Validations
    if (!PACKAGE_NAME) {
      throw new Error('Package name is mandatory parameter');
    }

    if (fs.existsSync(PACKAGE_NAME)) {
      throw new Error(`Package folder already exists: ${PACKAGE_NAME}`);
    }

    // Create package folder
    fs.mkdirSync(PACKAGE_NAME);
    childProcess.execSync(`mkdir tmp-package && cd ./tmp-package && git clone https://github.com/Njs2/njs2-package-template.git`, { stdio: 'inherit' });
    childProcess.execSync(`cp -r ./tmp-package/njs2-package-template/package/* ${PACKAGE_NAME}`, { stdio: 'inherit' });
    childProcess.execSync(`rm -rf ./tmp-package`, { stdio: 'inherit' });
  } catch (error) {
    console.error(error.message);
  }
};