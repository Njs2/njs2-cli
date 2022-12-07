#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { checkAndFindVersion } = require('./utils');

const execute = async (CLI_KEYS, CLI_ARGS) => {
    try {

        if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
        throw new Error('njs2 upgrade should be ran from project root directory');
  
        const package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
        if (package_json['njs2-type'] != 'project') {
            throw new Error('njs2 upgrade should be ran from project root directory');
        }

        let REQUESTED_BASE_VERSION = "latest"
        if (checkAndFindVersion(CLI_ARGS)) {
            REQUESTED_BASE_VERSION = checkAndFindVersion(CLI_ARGS)
        }

        child_process.execSync(`npm uninstall @njs2/base`, { stdio: 'inherit' });
        child_process.execSync(`npm i @njs2/base@${REQUESTED_BASE_VERSION}`, { stdio: 'inherit' });

        // TODO: get all files at root level of this project

        // TODO: get all files from framework Template

        // TODO: write new files to this project

    } catch (e) {
      console.error(e);
      process.exit(1)
    }
  }
  
  module.exports.execute = execute;