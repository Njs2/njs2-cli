const fs = require('fs');
const path = require('path');

const initEnv = async (LIBRARY_NAME) => {
  let envFileContents = fs.readFileSync(path.resolve(process.cwd(), `node_modules/${LIBRARY_NAME}/env.json`), 'utf8');
  let projectEnvFileContents = fs.readFileSync(path.resolve(process.cwd(), `src/config/config.json`), 'utf8');
  envFileContents = JSON.parse(envFileContents);
  projectEnvFileContents = JSON.parse(projectEnvFileContents);

  const configKey = LIBRARY_NAME.split('/')[1].toUpperCase();
  projectEnvFileContents[configKey] ? Object.keys(envFileContents).map(key => {
    !projectEnvFileContents[configKey][key] ? projectEnvFileContents[configKey][key] = envFileContents[key] : false;
  }) : projectEnvFileContents[configKey] = envFileContents;

  fs.writeFileSync(path.resolve(process.cwd(), `src/config/config.json`), JSON.stringify(projectEnvFileContents, null, 2), 'utf8');
}

module.exports.initEnv = initEnv;