#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const colors = require("colors");

const initPackage = async (LIBRARY_NAME) => {
  const PACKAGE = require(`${path.resolve(`./node_modules/${LIBRARY_NAME}/package.json`)}`);

  try {
    const PLUGINS = PACKAGE['njs2-endpoints'];
    PLUGINS.map(plugin => {
      const METHOD_NAME = `${PACKAGE['njs2-method-prefix']}.${plugin}`;
      const METHODS_PATH = `src/methods/${METHOD_NAME}`;
      const COPY_TEMP_SCRIPT = `cp -rn "./node_modules/@njs2/base/template/pluginStructure/." "./${METHODS_PATH}"`;

      child_process.execSync(COPY_TEMP_SCRIPT);
      let executeFileContents = fs.readFileSync(path.resolve(`./${METHODS_PATH}/action.js`), 'utf8');
      executeFileContents = executeFileContents.replace(/<method-name>/g, METHOD_NAME.split(/(?:\.|-)+/).map((key, index) => key.charAt(0).toUpperCase() + key.slice(1)).join("")).replace(/<lib-name>/g, `${LIBRARY_NAME}/${plugin}`);
      fs.writeFileSync(path.resolve(`./${METHODS_PATH}/action.js`), executeFileContents);

      let initFileContents = fs.readFileSync(path.resolve(`./${METHODS_PATH}/init.js`), 'utf8');
      initFileContents = initFileContents.replace(/<method-name>/g, METHOD_NAME.split(/(?:\.|-)+/).map((key, index) => key.charAt(0).toUpperCase() + key.slice(1)).join("")).replace(/<lib-name>/g, `${LIBRARY_NAME}/${plugin}`);
      fs.writeFileSync(path.resolve(`./${METHODS_PATH}/init.js`), initFileContents);
    });
  } catch (e) {
    console.log(colors.red(e));
  }
}

module.exports.initPackage = initPackage;