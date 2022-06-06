const fs = require("fs");
const path = require("path");

const initEnv = async (LIBRARY_NAME) => {
  let envFileContents = fs.readFileSync(
    path.resolve(process.cwd(), `node_modules/${LIBRARY_NAME}/env.json`),
    "utf8"
  );
  let projectEnvFileContents = fs.readFileSync(
    path.resolve(process.cwd(), `src/config/config.json`),
    "utf8"
  );
  envFileContents = JSON.parse(envFileContents);
  projectEnvFileContents = JSON.parse(projectEnvFileContents);

  if (Array.isArray(envFileContents)) {
    // If public package then read other then organisation name key
    const configKey =
      LIBRARY_NAME.split("/").length == 1
        ? LIBRARY_NAME.toUpperCase()
        : LIBRARY_NAME.split("/")[1].toUpperCase();
    envFileContents.forEach((envDetail) => {
      if (envDetail.parent == "") {
        if (projectEnvFileContents[configKey]) {
          Object.keys(envDetail).map((key) => {
            if (!projectEnvFileContents[configKey][key] && key != "parent")
              projectEnvFileContents[configKey][key] = envDetail[key];
          });
        } else {
          delete envDetail.parent;
          projectEnvFileContents[configKey] = envDetail;
        }
      } else {
        let parentName = envDetail.parent;

        if (projectEnvFileContents[envDetail.parent]) {
          Object.keys(envDetail).map((key) => {
            projectEnvFileContents[parentName][LIBRARY_NAME] = {
              mCron: envDetail.mCron,
              cron: envDetail.cron,
            };
          });
        } else {
          delete envDetail.parent;
          projectEnvFileContents[parentName] = { [LIBRARY_NAME]: envDetail };
        }
      }
    });

    fs.writeFileSync(
      path.resolve(process.cwd(), `src/config/config.json`),
      JSON.stringify(projectEnvFileContents, null, 2),
      "utf8"
    );
  } else {
    // If public package then read other then organisation name key
    const configKey =
      LIBRARY_NAME.split("/").length == 1
        ? LIBRARY_NAME
        : LIBRARY_NAME.split("/")[1].toUpperCase();
    if (projectEnvFileContents[configKey]) {
      Object.keys(envFileContents).map((key) => {
        if (!projectEnvFileContents[configKey][key])
          projectEnvFileContents[configKey][key] = envFileContents[key];
      });
    } else {
      projectEnvFileContents[configKey] = envFileContents;
    }

    fs.writeFileSync(
      path.resolve(process.cwd(), `src/config/config.json`),
      JSON.stringify(projectEnvFileContents, null, 2),
      "utf8"
    );
  }
};

module.exports.initEnv = initEnv;


