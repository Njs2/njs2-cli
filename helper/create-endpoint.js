#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const createEndpoint = async (CLI_KEYS, CLI_ARGS) => {
  if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
    throw new Error('njs2 endpoint <endpoint-name> to be run from project root directory');

  const package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
  if (package_json['njs2-type'] != 'project') {
    throw new Error('njs2 endpoint <endpoint-name> to be run from project root directory');
  }

  try {
    let splitString = CLI_ARGS[0].split("/");
    splitString = splitString.map((element, index) => {
      //Checking for index > 1 because if method name is "/user/detail" then second resource(detail) should
      //get converted to Pascal case "user" should be camel case
      if (index == 1) {
        element = `.${element}`;
      } else if (index > 1) {
        element = element.charAt(0).toUpperCase() + element.slice(1);
      }
      return element;
    })
    const METHOD_NAME = splitString.join('');
    const METHODS_PATH = `src/methods/${METHOD_NAME}`;
    if (fs.existsSync(METHODS_PATH)) {
      throw new Error(`Method folder already exists: ${METHODS_PATH}`);
    }
    const COPY_TEMP_SCRIPT = `cp -rn ${path.resolve(process.cwd(), '.')}/node_modules/@njs2/base/package/template/methodStructure/. ${path.resolve(process.cwd(), '.')}/${METHODS_PATH}`;

    child_process.execSync(COPY_TEMP_SCRIPT);
    let executeFileContents = fs.readFileSync(path.resolve(process.cwd(), `${METHODS_PATH}/action.js`), 'utf8');
    executeFileContents = executeFileContents
      .replace(/<method-name>/g, METHOD_NAME.split(/(?:\.|-)+/).map((key, index) => key.charAt(0).toUpperCase() + key.slice(1)).join(""));
    fs.writeFileSync(path.resolve(process.cwd(), `${METHODS_PATH}/action.js`), executeFileContents);

    let initFileContents = fs.readFileSync(path.resolve(process.cwd(), `${METHODS_PATH}/init.js`), 'utf8');
    initFileContents = initFileContents
      .replace(/<method-name>/g, METHOD_NAME.split(/(?:\.|-)+/).map((key, index) => key.charAt(0).toUpperCase() + key.slice(1)).join(""))
      .replace(/<method-type>/g, 'GET')
      .replace(/<is-secured>/g, false);
    fs.writeFileSync(path.resolve(process.cwd(), `${METHODS_PATH}/init.js`), initFileContents);
  } catch (e) {
    console.log(e);
  }
}

module.exports.createEndpoint = createEndpoint;