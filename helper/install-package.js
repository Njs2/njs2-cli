#!/usr/bin/env node
const tar = require("tar");
const fs = require("fs");
const child_process = require("child_process");
const AWS = require('aws-sdk');
const path = require('path');
const { validatePackageVersion, getCrossAccountCredentials } = require("./utils");
const inquirer = require('inquirer');

const PACKAGE_BASE_PATH = 'packages';
const DEFAULT_BUCKET_NAME = 'njs2';
const AWS_DEFAULT_PROFILE = 'NJS2-REPO';
let awsConfig = null;
let s3BucketName = null;

/**
 * @function downloadPackage
 * @param {*} uri 
 * @param {*} filename 
 * @param {*} callback 
 * @description Download the package files from remote URI
 */
const downloadPackage = async (uri, filename) => {
  let s3;
  if (awsConfig.AWS_PROFILE && awsConfig.AWS_PROFILE.length > 0) {
    let credentials = new AWS.SharedIniFileCredentials({ profile: awsConfig.AWS_PROFILE });
    AWS.config.credentials = credentials;
    s3 = new AWS.S3();
  } else {
    const credentials = await getCrossAccountCredentials(awsConfig);
    s3 = new AWS.S3(credentials);
  }
  const data = await s3.getObject({
    Bucket: s3BucketName,
    Key: uri
  }).promise();

  fs.writeFileSync(filename, data.Body);
  console.log('file downloaded successfully');
};

/**
 * @function isPackageExists
 * @param {*} url 
 * @returns {Promise<boolean>}
 * @description Check if remote file exists
 */
const isPackageExists = async (url) => {
  let s3;
  if (awsConfig.AWS_PROFILE && awsConfig.AWS_PROFILE.length > 0) {
    let credentials = new AWS.SharedIniFileCredentials({ profile: awsConfig.AWS_PROFILE });
    AWS.config.credentials = credentials;
    s3 = new AWS.S3();
  } else {
    const credentials = await getCrossAccountCredentials(awsConfig);
    s3 = new AWS.S3(credentials);
  }
  try {
    await s3.headObject({
      Bucket: s3BucketName,
      Key: url
    }).promise();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const replaceAt = function (str, index, replacement) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

const getAWSConfig = async () => {
  const awsTypeRes = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'aws_type',
        message: 'Select AWS credentials type:',
        choices: ['CLI Profile', 'Access credentials'],
      }
    ]);

  if (awsTypeRes.aws_type === 'CLI Profile') {
    const awsProfileRes = await inquirer
      .prompt([
        {
          type: 'input',
          name: 'aws_profile',
          message: 'AWS profile name:',
          default: AWS_DEFAULT_PROFILE,
          validate: (val) => {
            return val && val.length > 0;
          }
        }
      ]);

    awsConfig = {
      AWS_PROFILE: awsProfileRes.aws_profile
    };
    return awsConfig;
  } else {
    const awsAccessRes = await inquirer
      .prompt([
        {
          type: 'input',
          name: 'aws_access_key_id',
          message: 'AWS access key id:',
          validate: (val) => {
            return val && val.length > 0;
          }
        },
        {
          type: 'input',
          name: 'aws_secret_access_key',
          message: 'AWS secret access key:',
          validate: (val) => {
            return val && val.length > 0;
          }
        },
        {
          type: 'input',
          name: 'aws_role_arn',
          message: 'AWS Role ARN:',
          default: null
        },
        {
          type: 'input',
          name: 'region',
          message: 'AWS region:',
          default: 'ap-south-1'
        }
      ]);

    awsConfig = {
      AWS_ACCESS_KEY_ID: awsAccessRes.aws_access_key_id,
      AWS_SECRET_ACCESS_KEY_ID: awsAccessRes.aws_secret_access_key,
      AWS_ROLE_ARN: awsAccessRes.aws_role_arn,
      AWS_REGION: awsAccessRes.region
    };
    return awsConfig;
  }
}

const getS3BucketName = async () => {
  const cliRes = await inquirer
    .prompt([
      {
        type: 'input',
        name: 's3_bucket_name',
        message: 'Enter S3 bucket name:',
        default: DEFAULT_BUCKET_NAME,
        validate: (val) => {
          return val && val.length > 0;
        }
      }
    ]);

  s3BucketName = cliRes.s3_bucket_name;
  return cliRes.s3_bucket_name;
}

// $ njs2 package njs2-sms-twillio@1.0.1
const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('Run from project root direcory: njs2 package <package-name> (Eg: njs2-auth-email@latest)');

    const packageJson = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (packageJson['njs2-type'] != 'project') {
      throw new Error('Run from project root direcory: njs2 package  <package-name> (Eg: njs2 package njs2-auth-email@latest)');
    }

    let packageName = CLI_ARGS[0];
    if (!packageName || packageName.length == 0) {
      throw new Error('Invalid package name');
    }

    // If package name has @ keyword then 2nd arrgumnet is version and replace with valid version
    if (packageName.split('@').length == 2 && !validatePackageVersion(packageName.split('@')[1])) {
      throw new Error('Invalid package version');
    } else if (packageName.split('@').length == 1) {
      packageName = `${packageName}@latest`;
    }

    await getAWSConfig();
    await getS3BucketName();
    // If package name has @ keyword then 2nd arrgumnet is version and compute the remote path
    let PACKAGE_PATH = '';
    let remoteURL = '';
    if (packageName.split('@').length == 2 && packageName.split('@')[1] != 'latest') {
      PACKAGE_PATH = replaceAt(packageName, packageName.lastIndexOf('@'), '/');
      remoteURL = `${PACKAGE_BASE_PATH}/${PACKAGE_PATH}.tar.gz`;
    } else {
      PACKAGE_PATH = replaceAt(packageName.split('@').length == 2 && packageName.split('@')[1] == 'latest' ? packageName : `${packageName}@latest`, packageName.lastIndexOf('@'), '/');
      remoteURL = `${PACKAGE_BASE_PATH}/${PACKAGE_PATH}.tar.gz`;
    }

    const remoteFileExists = await isPackageExists(remoteURL);
    if (!remoteFileExists) throw new Error("Remote package dose not Exists!!")
    const urlComp = PACKAGE_PATH.split('/')[0];
    const fileName = `${urlComp}.tar.gz`;
    if (!fs.existsSync('njs2_modules'))
      fs.mkdirSync("njs2_modules");

    let folderName = fileName.split('.')[0];
    if (!fs.existsSync(`njs2_modules/${folderName}`))
      fs.mkdirSync(`njs2_modules/${folderName}`);

    // Download the package
    await downloadPackage(remoteURL, `./njs2_modules/${folderName}.tar.gz`);
    // Extract the package
    await tar.x({
      file: `./njs2_modules/${fileName}`,
      cwd: `njs2_modules/${folderName}`
    });
    console.log("exract completed");

    console.log("Installing package and dependencies!");
    child_process.execSync(`npm i "./njs2_modules/${folderName}"`, { stdio: 'inherit' });
    child_process.execSync(`npm i`, { stdio: 'inherit' });
    child_process.execSync(`rm "./njs2_modules/${fileName}"`);
    const pluginPackageJson = require(`${path.resolve(process.cwd(), `njs2_modules/${folderName}/package.json`)}`);

    if (pluginPackageJson['njs2-type'] == 'endpoint') {
      await require('./init-package').initPackage(folderName);
    }

    if (pluginPackageJson['loadEnv']) {
      await require('./init-env').initEnv(folderName);
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports.execute = execute;