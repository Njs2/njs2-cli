const path = require('path');
const child_process = require('child_process');
const fs = require('fs');
const colors = require("colors");

colors.setTheme({
  error: "red"
});

module.exports.execute = (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(`./package.json`)}`))
      throw new Error('Run from project root direcory: njs2 plugin uninstall <plugin-name> (Eg: njs2-auth-email)'.error);

    const packageJson = require(`${path.resolve(`./package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 plugin uninstall <plugin-name> (Eg: njs2 plugin uninstall njs2-auth-email)'.error);
    }

    let pluginName = CLI_ARGS[1];
    if (!pluginName || pluginName.length == 0) {
      throw new Error('Invalid plugin name'.error);
    }

    if(!pluginName.startsWith("@juego")) {
      pluginName = "@juego/" + pluginName.split('/').pop();
    }

    const packageExists = Object.keys(packageJson.dependencies).filter(package => package == pluginName);
    if (packageExists.length == 0) {
      throw new Error("Plugin Dose not exists!".error);
    }

    child_process.execSync(`npm uninstall ${pluginName}`, { stdio: "inherit" });
    // child_process.execSync(`rm -rf "${path.resolve(`./njs2_modules/${pluginName}`)}"`, { stdio: "inherit" });
  } catch (e) {
    console.error(colors.red(e));
  }
};