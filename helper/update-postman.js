const fs = require("fs");
const path = require('path');
require('bytenode');
baseInitialize = require(`${path.resolve(process.cwd(), `node_modules/@njs2/base/base/baseInitialize.class`)}`);
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

    let fileExists = false;
    Object.keys(paramsList).map(key => {
      if (paramsList[key].type == 'file') fileExists = true;
    });

    let apiDefination = {
      "name": apiPath.split('.').join('/'),
      "request": {
        "method": typeof apiInitObj.pkgInitializer.requestMethod == "string" ? apiInitObj.pkgInitializer.requestMethod.toUpperCase() : apiInitObj.pkgInitializer.requestMethod[0].toUpperCase(),
        "header": [{
          "key": 'enc_state',
          "value": '1',
          "disabled": true,
          "description": 'Encryption status: 1- Enable, 2- Disable',
          "type": "text"
        },
        {
          "key": 'lng_key',
          "value": 'en',
          "disabled": true,
          "description": 'Langauage key',
          "type": "text"
        }],
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

    if (apiInitObj.pkgInitializer.isSecured) {
      apiDefination.request.header.push({
        "key": "access_token",
        "value": "",
        "description": "JWT access token",
        "type": "text"
      });
    }
    let paramsDef = Object.keys(paramsList).map(params => {
      return {
        "key": paramsList[params].name,
        "value": paramsList[params].default,
        "disabled": !paramsList[params].required,
        "description": paramsList[params].description,
        "type": fileExists && apiInitObj.pkgInitializer.requestMethod[0].toUpperCase() == 'POST' && paramsList[params].type == "file" ? "file" : "text"
      };
    });

    if (!(fileExists && apiInitObj.pkgInitializer.requestMethod[0].toUpperCase() == 'POST')) {
      paramsDef.push({
        "key": 'data',
        "value": '',
        "disabled": true,
        "description": 'Encrypted data and url encode(URLSearchParams) the encrypted data to handle special characters',
        "type": "text"
      });
    }

    if (apiInitObj.pkgInitializer.requestMethod[0].toUpperCase() == 'GET') {
      apiDefination.request.url.query = paramsDef;
    } else if (apiInitObj.pkgInitializer.requestMethod[0].toUpperCase() == 'POST') {
      if (fileExists) {
        apiDefination.request.body = {
          "mode": "formdata",
          "formdata": paramsDef
        }
      } else {
        apiDefination.request.body = {
          "mode": "urlencoded",
          "urlencoded": paramsDef
        }
      }
    }

    return apiDefination;
  });

  fs.writeFileSync('postman.json', JSON.stringify(apiRes, null, 2));
  return apiRes;
}

module.exports.updatePostman = updatePostman;