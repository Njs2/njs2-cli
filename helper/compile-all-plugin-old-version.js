#!/usr/bin/env nodeconst 

// **************************
// ****** NOT IN USE ********
// **************************

fs = require('fs-extra');
let bytenode = require("bytenode");
const path = require('path');
const inquirer = require('inquirer');
const child_process = require('child_process');
const { promisify } = require('util');
const exec = promisify(child_process.exec);
// const filePath = 'dist/compiled';
let excludeFolders = ['tmp'];
// let registryUrl = 'http://3.6.39.10/';
let registryUrl = 'http://localhost:8000/';
const package_json = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!package_json || !package_json['njs2-type']) {
  throw new Error("Run this comand from NJS2 base/endpoint/helper package directory...");
}
let syncRemote = false;
let encryptStatus = true;
let nodeVersions = [];
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
const obfuscateFilesInDirectory = async (dirPath, excludeFolders) => {
  try {
    let files = fs.readdirSync(dirPath);
    //Checks if path specified in arguments has a sub directory            
    for (let i = 0; i < files.length; i++) {
      let pathName = path.join(dirPath, files[i]);
      let stat = fs.lstatSync(pathName);
      if (package_json['njs2-type'] == 'base' && pathName.replace(/\\/g, '/') == 'dist/compiled/template') continue;
      if (stat.isDirectory() && !excludeFolders.includes(pathName.replace(/\\/g, '/'))) {
        await obfuscateFilesInDirectory(pathName, excludeFolders);
      } else if (stat.isFile() && path.extname(pathName) == '.js') {
        response = await bytenode.compileFile({
          filename: pathName        });
        fs.removeSync(pathName);
        console.log("Successfully encrypted : ", pathName);
      }
    }
  } catch (e) {
    console.log("\nError in encrypting files in directory", dirPath, e);
  }
}
const obfuscateFiles = async (filePath = "src", excludeFolders) => {
  try {
    let stat = fs.lstatSync(filePath);
    for (let index = 0; index < excludeFolders.length; index++) {
      excludeFolders[index] = excludeFolders[index].replace(/\\/g, '/');
    }
    if (stat.isFile()) {
      if (path.extname(filePath) != '.js') {
        console.log("Skipping ", filePath);
        return;
      }
      response = await bytenode.compileFile({
        filename: filePath      });
      fs.removeSync(filePath);
      console.log("Successfully encrypted : ", filePath);
    } else if (stat.isDirectory() && !excludeFolders.includes(filePath.replace(/\\/g, '/'))) {
      await obfuscateFilesInDirectory(filePath, excludeFolders);
    }
  } catch (e) {
    console.log("\nError in encrypting file", e);
  }
}
/** * @description * njs2 compile * */
const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('njs2 compile (Run from package directory) root directory');
      
    let package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (!(package_json['njs2-type'] == 'endpoint' || package_json['njs2-type'] == 'helper')) {
      throw new Error('njs2 compile (Run from package directory) root directory');
    }

    // add node version in package.json
    package_json.nodeVersion = process.version;
    fs.writeFileSync(`${path.resolve(process.cwd(), `package.json`)}`, JSON.stringify(package_json, null, 2));

    await getRegistryUploadStatus();
    //Check the Current Node version             
    let nodeVersion = process.version.slice(1,3);
    console.log('Current Node Version ', nodeVersion);
    nodeVersions.push(nodeVersion);
    if (!fs.existsSync('dist'))
      fs.mkdirSync("dist");
    //Iterating to create compiled file for the above Node version            
    await Promise.all(nodeVersions.map(async version => {
      let filePath = `dist/${version}`;
      if (!fs.existsSync(`dist/${version}`))
        fs.mkdirSync(`dist/${version}`);
      else {
        // empty dist folder                        
        fs.emptyDirSync(`dist/${version}`);
      }
      // Check if plugin name exists, if yes delete the existing files and copy current folder contents to dist/compiled folder                  
      child_process.execSync(` rsync -r --exclude 'dist' * ./dist/${version}`);
      if (encryptStatus) await obfuscateFiles(filePath, excludeFolders);
    }));
    if (syncRemote) await uploadFileToRegistry('dist');
  } catch (e) {
    console.error(e);
  }
}
module.exports.execute = execute;