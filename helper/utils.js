const AWS = require('aws-sdk');
const path = require('path');
const child_process = require('child_process');
const fs = require('fs');
const colors = require("colors");

const nodeVersions = ['12', '14', '16'];

/**
 * 
 * @param {*} awsConfig {
 * AWS_ROLE_ARN: 'arn:aws:iam::123456789012:role/njs2-cli-role',
 * AWS_REGION: 'us-east-1',
 * AWS_PROFILE: 'njs2-cli-profile',
 * AWS_ACCESS_KEY_ID: '',
 * AWS_SECRET_ACCESS_KEY: ''
 * }
 * @returns credentials
 */
module.exports.getCrossAccountCredentials = async (awsConfig) => {
  return new Promise((resolve, reject) => {
    if (!awsConfig.AWS_ROLE_ARN || (awsConfig.AWS_ROLE_ARN && awsConfig.AWS_ROLE_ARN.length == 0)) {
      resolve({
        region: awsConfig.AWS_REGION,
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY_ID
      });
    } else {
      const sts = new AWS.STS({
        region: awsConfig.AWS_REGION,
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY_ID,
      });
      const timestamp = (new Date()).getTime();
      const params = {
        RoleArn: awsConfig.AWS_ROLE_ARN,
        RoleSessionName: `NJS-CLI-${timestamp}`
      };

      sts.assumeRole(params, (err, data) => {
        if (err) reject(err);
        else {
          resolve({
            region: awsConfig.AWS_REGION,
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretAccessKey,
            sessionToken: data.Credentials.SessionToken,
          });
        }
      });
    }
  });
}

module.exports.isValidVarName = (name) => {
  try {
    Function('var ' + name);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports.validatePackageVersion = (val) => {
  return val == 'latest' || (val && val.length > 0 && val.split('.').map(val => isNaN(parseInt(val)) ? 0 : 1).reduce((accumulator, currentValue) => accumulator + currentValue) == 3);
}

module.exports.checkAndFindVersion = (CLI_ARGS) => {
  return CLI_ARGS.includes("version")? CLI_ARGS[CLI_ARGS.indexOf("version")+1]?? false : false;
}

module.exports.updateNodeModulesStructure = async (pluginName) => {
  
  const nodeVersion = process.version.slice(1,3);

  // get path to private plugin. plugin starting with `@juego`
  const pluginPath = path.resolve(`./node_modules/${pluginName}/${nodeVersion}`)

  // check if folder exists
  if(!fs.existsSync(pluginPath)) 
    throw new Error(colors.red(`Package ${pluginName} for node version ${nodeVersion} is not found. Please try with other node version.`))

  let fileList = await fs.promises.readdir(pluginPath);

  // Check if folder is empty
  if(fileList.length === 0)
    throw new Error(colors.red(`Package ${pluginName} for node version ${nodeVersion} is not found. Please try with other node version.`))

  // Get destination folder name
  const destinationPath = path.resolve(`./node_modules/${pluginName}/`);

  // copy all files from version specific folder to root folder
  child_process.execSync(`cp -r ${pluginPath}/. ${destinationPath}`);

  console.log(colors.bold("****** Copied files to root folder ******"));

  // remove version specific folders
  const folderNames = await fs.promises.readdir(path.resolve(`./node_modules/${pluginName}`))

  await Promise.all(folderNames.map(async (folderName) => {
    // ignore if not version folder
    if(!nodeVersions.includes(folderName)) return;

    console.log(`Copied files for Node v${folderName}.x.x`.green);
    const folderPath = path.resolve(`./node_modules/${pluginName}/${folderName}`);
    if(fs.existsSync(folderPath)) {
      child_process.execSync(`rm -rf ${folderPath}`)
    }
  }))

  console.log(colors.bold("****** Version specific folders deleted ******"));

}

module.exports.updateSrcFiles = async (folderName) => {
  const pluginPackageJson = require(`${path.resolve(`./node_modules/${folderName}/package.json`)}`);
  
  if (pluginPackageJson['njs2-type'] == 'endpoint') {
    await require('./init-plugin').initPackage(folderName);
  }

  if (pluginPackageJson['loadEnv']) {
    await require('./init-env').initEnv(folderName);
  }

}