#!/usr/bin/env node
const fs = require('fs-extra');
let bytenode = require("bytenode");
const path = require('path');
const tar = require('tar');

const filePath = 'dist/compiled';
let excludeFolders = ['tmp'];

const package_json = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!package_json || !package_json['njs2-type']) {
  throw new Error("Run this comand from NJS2 base/endpoint/helper plugin directory...");
}

const obfuscateFilesInDirectory = async (dirPath, excludeFolders) => {
  try {
    let files = fs.readdirSync(dirPath);

    //Checks if path specified in arguments has a sub directory
    for (let i = 0; i < files.length; i++) {
      let pathName = path.join(dirPath, files[i]);
      let stat = fs.lstatSync(pathName);
      if (package_json['njs2-type'] == 'base' && pathName.replace(/\\/g, '/') == 'dist/compiled/package/template') continue;

      if (stat.isDirectory() && !excludeFolders.includes(pathName.replace(/\\/g, '/'))) {
        await obfuscateFilesInDirectory(pathName, excludeFolders);
      } else if (stat.isFile() && path.extname(pathName) == '.js') {
        response = bytenode.compileFile({
          filename: pathName
        });
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
      response = bytenode.compileFile({
        filename: filePath
      });
      fs.removeSync(filePath);
      console.log("Successfully encrypted : ", filePath);

    } else if (stat.isDirectory() && !excludeFolders.includes(filePath.replace(/\\/g, '/'))) {
      await obfuscateFilesInDirectory(filePath, excludeFolders);
    }
  } catch (e) {
    console.log("\nError in encrypting file", e);
  }
}

const compile = async () => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('njs2 compile (Run from plugin directory) root directory');

    const package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (!(package_json['njs2-type'] == 'base' || package_json['njs2-type'] == 'endpoint' || package_json['njs2-type'] == 'websocket' || package_json['njs2-type'] == 'helper')) {
      throw new Error('njs2 compile (Run from plugin directory) root directory');
    }

    const child_process = require("child_process");
    if (!fs.existsSync('dist'))
      fs.mkdirSync("dist");

    child_process.execSync(`if [ -e ./dist/${package_json.name}@${package_json.version}.tar.gz ];
      then rm -rf ./dist/${package_json.name}@${package_json.version}.tar.gz ;
      fi && rsync -r * ./dist/compiled`);

    await obfuscateFiles(filePath, excludeFolders);

    await tar.c(
      {
        C: 'dist/compiled',
        filter: (pathname => { return pathname != 'dist'; })
      },
      fs.readdirSync('./dist/compiled')
    ).pipe(fs.createWriteStream(`./dist/${package_json.name}@${package_json.version}.tar.gz`)).on('close', () => {
      fs.rmdirSync('./dist/compiled', { recursive: true });
    });
  } catch (e) {
    console.error(e);
  }
}

module.exports.compile = compile;