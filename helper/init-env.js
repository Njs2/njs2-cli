const fs = require('fs');
const path = require('path');

const initEnv = async (LIBRARY_NAME) => {
  let envFileContents = fs.readFileSync(path.resolve(process.cwd(), `Njs2-modules/${LIBRARY_NAME}/env.json`), 'utf8');
  let projectEnvFileContents = fs.readFileSync(path.resolve(process.cwd(), `src/config/config.json`), 'utf8');
  envFileContents = JSON.parse(envFileContents);
  projectEnvFileContents = JSON.parse(projectEnvFileContents);

  projectEnvFileContents[LIBRARY_NAME] ? Object.keys(envFileContents).map(key => {
    !projectEnvFileContents[LIBRARY_NAME][key] ? projectEnvFileContents[LIBRARY_NAME][key] = envFileContents[key] : false;
  }) : projectEnvFileContents[LIBRARY_NAME] = envFileContents;

  fs.writeFileSync(path.resolve(process.cwd(), `src/config/config.json`), JSON.stringify(projectEnvFileContents, null, 2), 'utf8');
}

module.exports.initEnv = initEnv;