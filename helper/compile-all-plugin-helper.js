filePath = process.argv.slice(2)[0];
excludeFolders = process.argv.slice(2)[1];

const fs = require('fs-extra');
let bytenode = require("bytenode");
const path = require('path');
const package_json = JSON.parse(fs.readFileSync(`${filePath}/package.json`, 'utf-8'));
console.log(package_json);

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


  console.log('filePath==>', process.cwd(), filePath);
  console.log('excludeFolders==>', excludeFolders);
  (async execute => {
    try {
        if (!fs.existsSync(`${path.resolve(filePath, `package.json`)}`))
          throw new Error('njs2 compile (Run from package directory) root directory');
        const package_json = require(`${path.resolve(filePath, `package.json`)}`);
        if (!(package_json['njs2-type'] == 'endpoint' || package_json['njs2-type'] == 'helper')) {
          throw new Error('njs2 other compile (Run from plugin directory) root directory');
        }
        await obfuscateFiles(filePath, excludeFolders);
    } catch(e) {
        console.log(e);
    }
  })();