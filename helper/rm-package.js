const path = require('path');
const child_process = require('child_process');
const fs = require('fs');

module.exports.execute = (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('Run from project root direcory: njs2 rm-package <package-name> (Eg: njs2-auth-email)');

    const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 rm-package <package-name> (Eg: njs2 rm-package njs2-auth-email)');
    }

    let packageName = CLI_ARGS[0];
    if (!packageName || packageName.length == 0) {
      throw new Error('Invalid package name');
    }

    const packageExists = Object.keys(packageJson.dependencies).filter(package => package == packageName);
    if (packageExists.length == 0) {
      throw new Error("Package Dose not exists!");
    }

    child_process.execSync(`npm uninstall ${packageName}`, { stdio: "inherit" });
    child_process.execSync(`rm -rf "${path.resolve(process.cwd(), `njs2_modules/${packageName}`)}"`, { stdio: "inherit" });
  } catch (e) {
    console.error(e);
  }
};