const fs = require("fs");
const path = require('path');
require('bytenode');
baseInitialize = require(`${path.resolve(process.cwd(), `Njs2-modules/njs2-base/base/baseInitialize.class`)}`);
const updatePostman = async () => {
  if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
    throw new Error('njs2 update-postman to be run from project root directory');

  const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
  if (packageJson['njs2-type'] != 'project') {
    throw new Error('njs2 update-postman to be run from project root directory');
  }

  const base_url = require(path.resolve(process.cwd(), "src/config/config.json")).API_ENDPOINT;
  const apiPaths = fs.readdirSync(path.resolve(process.cwd(), "src/methods"), { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
  const apiRes = {
    "info": {
      "_postman_id": packageJson.name,
      "name": packageJson.name,
      "description": `${packageJson.description}`,
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: []
  };
  apiRes.item = apiPaths.map(apiPath => {
    const apiInit = require(path.resolve(process.cwd(), `src/methods/${apiPath}/init.js`));
    const apiInitObj = new apiInit();
    const paramsList = apiInitObj.getParameter();

    let apiDefination = {
      "name": apiPath.split('.').join('/'),
      "request": {
        "method": apiInitObj.pkgInitializer.requestMethod.toUpperCase(),
        "header": apiInitObj.pkgInitializer.isSecured ? [{
          "key": "access_token",
          "value": "",
          "description": "JWT access token",
          "type": "text"
        }] : [],
        "url": {
          "raw": `${base_url && base_url.length ? base_url : '{{base_url}}'}/${apiPath.split('.').join('/')}`,
          "host": [
            `${base_url && base_url.length ? base_url : '{{base_url}}'}`
          ],
          "path": apiPath.split('.')
        }
      },
      "response": []
    };

    const paramsDef = Object.keys(paramsList).map(params => {
      return {
        "key": paramsList[params].name,
        "value": paramsList[params].default,
        "disabled": !paramsList[params].required,
        "description": paramsList[params].description,
        "type": "text"
      };
    });

    if (apiInitObj.pkgInitializer.requestMethod.toUpperCase() == 'GET') {
      apiDefination.request.url.query = paramsDef;
    } else if (apiInitObj.pkgInitializer.requestMethod.toUpperCase() == 'POST') {
      apiDefination.request.body = {
        "mode": "urlencoded",
        "urlencoded": paramsDef
      }
    }

    return apiDefination;
  });

  fs.writeFileSync('postman.json', JSON.stringify(apiRes, null, 2));
  return apiRes;
}

module.exports.updatePostman = updatePostman;