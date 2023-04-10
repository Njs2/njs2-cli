#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { checkAndFindVersion } = require('./utils');
const colors = require("colors");

const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    const PROJECT_NAME = CLI_ARGS[0];
    let BASE_VERSION = "latest"
    // Validations
    if (!PROJECT_NAME) {
      
      throw new Error('Project name is mandatory parameter'.red);
    }

    if (fs.existsSync(PROJECT_NAME)) {
      throw new Error(`Project folder already exists: ${PROJECT_NAME}`.red);
    }

    if (checkAndFindVersion(CLI_ARGS)) {
      BASE_VERSION = checkAndFindVersion(CLI_ARGS)
    } else {
      console.log("Defaulting to @njs2/base@latest".bold)
      console.log("Did you know now you can pass version to njs2 project command? e.g.: njs2 project <project-name> version 2.0.1".bold)
    }

    child_process.execSync(`mkdir ${PROJECT_NAME} && cd ${PROJECT_NAME} && npm init -y`, { stdio: 'inherit' });
    // TODO: change to default npm registry
    child_process.execSync(`cd ${PROJECT_NAME} && npm i @njs2/base@${BASE_VERSION}`, { stdio: 'inherit' });
    const dependencies = require(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`).dependencies;
    child_process.execSync(`cd ${PROJECT_NAME} && cp -rf ./node_modules/@njs2/base/template/frameworkStructure/. .`, { stdio: 'inherit' });
    let packageJson = JSON.parse(fs.readFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, 'utf8'));
    packageJson['njs2-type'] = 'project';
    packageJson['name'] = PROJECT_NAME;
    packageJson['dependencies'] = dependencies;
    fs.writeFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, JSON.stringify(packageJson, null, 2));
    child_process.execSync(`cd ${PROJECT_NAME} && npm i`, { stdio: 'inherit' });
  } catch (e) {
    console.error(colors.red(e));
  }
}

module.exports.execute = execute;
