#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const BASE_PACKAGE_URL = 'https://github.com/Njs2/njs2-base.git';

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
    fs.writeFileSync(`${path.resolve(process.cwd(), `${PROJECT_NAME}/package.json`)}`, JSON.stringify(packageJson, null, 2));
    child_process.execSync(`cd ${PROJECT_NAME} && npm i ${BASE_PACKAGE_URL}`, { stdio: 'inherit' });
    child_process.execSync(`cd ${PROJECT_NAME} && cp -rn ./node_modules/njs2-base/package/template/frameworkStructure/. .`, { stdio: 'inherit' });
    child_process.execSync(`cd ${PROJECT_NAME} && npm i -D serverless-prune-plugin serverless-offline`, { stdio: 'inherit' });
  } catch (e) {
    console.log(e);
  }
}

module.exports.createProject = createProject;