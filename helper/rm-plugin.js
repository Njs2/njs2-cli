const path = require('path');
const child_process = require('child_process');
const fs = require('fs');

module.exports.execute = (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('Run from project root direcory: njs2 rm-plugin <plugin-name> (Eg: njs2-auth-email)');

    const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 rm-plugin <plugin-name> (Eg: njs2 rm-plugin njs2-auth-email)');
    }

    let pluginName = CLI_ARGS[0];
    if (!pluginName || pluginName.length == 0) {
      throw new Error('Invalid plugin name');
    }

    const packageExists = Object.keys(packageJson.dependencies).filter(package => package == pluginName);
    if (packageExists.length == 0) {
      throw new Error("Plugin Dose not exists!");
    }

    child_process.execSync(`npm uninstall ${pluginName}`, { stdio: "inherit" });
    child_process.execSync(`rm -rf "${path.resolve(process.cwd(), `njs2_modules/${pluginName}`)}"`, { stdio: "inherit" });
  } catch (e) {
    console.error(e);
  }
};