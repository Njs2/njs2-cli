#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
// TODO: @njs2/base
const BASE_PACKAGE_URL = 'https://github.com/Njs2/njs2-base.git#main';

const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    const PROJECT_NAME = CLI_ARGS[0];
    // Validations
    if (!PROJECT_NAME) {
      throw new Error('Project name is mandatory parameter');
    }

    if (fs.existsSync(PROJECT_NAME)) {
      throw new Error(`Project folder already exists: ${PROJECT_NAME}`);
    }

    child_process.execSync(`mkdir ${PROJECT_NAME} && cd ${PROJECT_NAME} && npm init -y`, { stdio: 'inherit' });
    child_process.execSync(`cd ${PROJECT_NAME} && npm i ${BASE_PACKAGE_URL}`, { stdio: 'inherit' });
    const dependencies = require(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`).dependencies;
    child_process.execSync(`cd ${PROJECT_NAME} && cp -rf ./node_modules/@njs2/base/template/frameworkStructure/. .`, { stdio: 'inherit' });
    let packageJson = JSON.parse(fs.readFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, 'utf8'));
    packageJson['njs2-type'] = 'project';
    packageJson['name'] = PROJECT_NAME;
    packageJson['dependencies'] = dependencies;
    fs.writeFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, JSON.stringify(packageJson, null, 2));
    child_process.execSync(`cd ${PROJECT_NAME} && npm i`, { stdio: 'inherit' });
  } catch (e) {
    console.error(e);
  }
}

module.exports.execute = execute;
