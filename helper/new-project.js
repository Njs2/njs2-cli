#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE_PACKAGE_URL = '@njs2/base';

const createProject = async (CLI_KEYS, CLI_ARGS) => {
  if (CLI_ARGS.length == 0) {
    throw new Error('Project name is mandatory parameter');
  }

  try {
    const PROJECT_NAME = CLI_ARGS[0];
    if (fs.existsSync(PROJECT_NAME)) {
      throw new Error(`Project folder already exists: ${PROJECT_NAME}`);
    }
    child_process.execSync(`mkdir ${PROJECT_NAME} && cd ${PROJECT_NAME} && npm init -y`, { stdio: 'inherit' });
    let packageJson = require(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`);
    packageJson['njs2-type'] = 'project';
    packageJson['devDependencies'] = {
      "serverless-offline": "^7.0.0",
      "eslint": "7.6.0",
      "eslint-config-airbnb-base": "14.2.0",
      "eslint-config-prettier": "6.11.0",
      "eslint-plugin-import": "2.22.0",
      "eslint-plugin-node": "11.1.0",
      "eslint-plugin-security": "1.4.0",
      "prettier": "2.0.5",
      "serverless-prune-plugin": "^1.5.1"
    };
    packageJson['scripts'] = {
      "lint": "eslint . --ext .js"
    };
    fs.writeFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, JSON.stringify(packageJson, null, 2));
    child_process.execSync(`cd ${PROJECT_NAME} && npm i ${BASE_PACKAGE_URL}`, { stdio: 'inherit' });
    child_process.execSync(`cd ${PROJECT_NAME} && cp -rn ./node_modules/@njs2/base/package/template/frameworkStructure/. .`, { stdio: 'inherit' });
    child_process.execSync(`cd ${PROJECT_NAME} && npm i`, { stdio: 'inherit' });
  } catch (e) {
    console.log(e);
  }
}

module.exports.createProject = createProject;