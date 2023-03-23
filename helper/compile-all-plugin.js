#!/usr/bin/env nodeconst 
fs = require('fs-extra');
let bytenode = require("bytenode");
const path = require('path');
const inquirer = require('inquirer');
const child_process = require('child_process');
const { promisify } = require('util');
const exec = promisify(child_process.exec);
const colors = require("colors");

// const filePath = 'dist/compiled';
let excludeFolders = ['tmp'];
let registryUrl = 'https://plugins.juegogames.com';
const package_json = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!package_json || !package_json['njs2-type']) {
  throw new Error("Run this comand from NJS2 base/endpoint/helper package directory...".red);
}
let syncRemote = false;
let encryptStatus = true;
let versionManager = false;
let nodeVersions = ["12", "14", "16"];
const uploadFileToRegistry = async ( filepath ) => {
  child_process.execSync(`cp package.json ${filepath} && cd ${filepath} && npm publish --registry ${registryUrl}`);
};
const getRegistryUploadStatus = async () => {
  const cliRes = await inquirer.prompt([
    {
      type: 'list',
      name: 'sync-remote',
      message: 'Update plugin to Juego Registry?',
      choices: ["Yes", "No"]
    }
  ]);
  syncRemote = cliRes['sync-remote'] == "Yes";
}

const getVersionManagerChoice = async () => {
  const cliRes = await inquirer.prompt([
    {
      type: 'list',
      name: 'version-manager',
      message: `It is a pre-requisite for you to have a Node Version Manager installed locally.
                Which one do you have?`,
      choices: ["NVM", "Not Installed"]
    }
  ]);
  versionManager = cliRes['version-manager'] == "Not Installed" ? false : cliRes['version-manager'];
}

/** * @description * njs2 compile * */
const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {

    // get version manager
    await getVersionManagerChoice();
    if(!versionManager) {
      throw colors.yellow("Compile process cannot continue without a Node Version manager. Good Bye!");
    }

    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('njs2 compile (Run from plugin directory) root directory'.red);
    
    let package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (!(package_json['njs2-type'] == 'endpoint' || package_json['njs2-type'] == 'helper')) {
      throw new Error('njs2 compile (Run from plugin directory) root directory'.red);
    }

    // add node version in package.json
    package_json.nodeVersion = process.version;
    fs.writeFileSync(`${path.resolve(process.cwd(), `package.json`)}`, JSON.stringify(package_json, null, 2));

    await getRegistryUploadStatus();
    //Check the Current Node version         
    let nodeVersion = process.version.slice(1,3);
    console.log(`Current Node Version ${nodeVersion}`.green);
    //nodeVersions.push(nodeVersion);
    if (!fs.existsSync('dist'))
      fs.mkdirSync("dist");
    //Iterating to create compiled file for the above Node version        
    await Promise.all(nodeVersions.map(async version => {
      try {
        let filePath = `dist/${version}`;
        if (!fs.existsSync(`dist/${version}`))
          fs.mkdirSync(`dist/${version}`);
        else {
          // empty dist folder                
          fs.emptyDirSync(`dist/${version}`);
        }
        // Check if plugin name exists, if yes delete the existing files and copy current folder contents to dist/compiled folder            
        child_process.execSync(` rsync -r --exclude 'dist' * ./dist/${version}`);
        console.log(`Compiling for node version ${version}`.green);

        // add node version in package.json
        // let packageJson = require(`${path.resolve(process.cwd(), `${filePath}/package.json`)}`);
        // packageJson.nodeVersion = version;
        // fs.writeFileSync(`${path.resolve(process.cwd(), `${filePath}/package.json`)}`, JSON.stringify(packageJson, null, 2));

        if (encryptStatus) {
          if(versionManager === "NVM") {
              child_process.execSync(`. ~/.nvm/nvm.sh && nvm run ${version} ~/.nvm/versions/node/${process.version}/lib/node_modules/@juego/njs2-cli2/helper/compile-all-plugin-helper.js ${process.cwd()}/${filePath} ${excludeFolders[0]}`);
          }
          console.log(`Compiled for node version ${version}`.green);
        }
      } catch(err) {
        console.log(`Node Version: ${version}.x not found!`.yellow);
        fs.emptyDirSync(`dist/${version}`);
        return;
      }
    }));
    if (syncRemote) await uploadFileToRegistry('dist');
  } catch (e) {
    console.error(colors.red(e));
  }
}
module.exports.execute = execute;