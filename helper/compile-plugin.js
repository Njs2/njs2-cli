#!/usr/bin/env node
const fs = require('fs-extra');
let bytenode = require("bytenode");
const path = require('path');
const tar = require('tar');
const inquirer = require('inquirer');
const AWS = require('aws-sdk');

const filePath = 'dist/compiled';
let excludeFolders = ['tmp'];

const package_json = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!package_json || !package_json['njs2-type']) {
  throw new Error("Run this comand from NJS2 base/endpoint/helper package directory...");
}

let awsConfig = null;
let s3BucketName = null;
let syncRemote = false;
let encryptStatus = true;
const PLUGIN_BASE_PATH = 'packages';
const DEFAULT_BUCKET_NAME = 'njs2';
const AWS_DEFAULT_PROFILE = 'NJS2-REPO';

const uploadFileToS3 = async (key, filename) => {
  let s3;
  if (awsConfig.AWS_PROFILE && awsConfig.AWS_PROFILE.length > 0) {
    let credentials = new AWS.SharedIniFileCredentials({ profile: awsConfig.AWS_PROFILE });
    AWS.config.credentials = credentials;
    s3 = new AWS.S3();
  } else {
    const credentials = await getCrossAccountCredentials(awsConfig);
    s3 = new AWS.S3(credentials);
  }

  const params = {
    Bucket: s3BucketName,
    Key: key,
    Body: fs.createReadStream(filename)
  };

  await s3.upload(params).promise();
};

const getAWSConfig = async () => {
  const cliRes = await inquirer.prompt([
    {
      type: 'list',
      name: 'sync-remote',
      message: 'Update plugin to remote S3?',
      choices: ["Yes", "No"]
    },
    {
      type: 'list',
      name: 'encrypt',
      message: 'Encrypting files?',
      choices: ["Yes", "No"],
      default: "Yes"
    }
  ]);

  syncRemote = cliRes['sync-remote'] == "Yes";
  encryptStatus = cliRes['encrypt'] == "Yes";
  if (!syncRemote) return;

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

const obfuscateFilesInDirectory = async (dirPath, excludeFolders) => {
  try {
    let files = fs.readdirSync(dirPath);

    //Checks if path specified in arguments has a sub directory
    for (let i = 0; i < files.length; i++) {
      let pathName = path.join(dirPath, files[i]);
      let stat = fs.lstatSync(pathName);
      if (package_json['njs2-type'] == 'base' && pathName.replace(/\\/g, '/') == 'dist/compiled/template') continue;

      if (stat.isDirectory() && !excludeFolders.includes(pathName.replace(/\\/g, '/'))) {
        await obfuscateFilesInDirectory(pathName, excludeFolders);
      } else if (stat.isFile() && path.extname(pathName) == '.js') {
        response = bytenode.compileFile({
          filename: pathName
        });
        fs.removeSync(pathName);
        console.log("Successfully encrypted : ", pathName);
      }
    }
  } catch (e) {
    console.log("\nError in encrypting files in directory", dirPath, e);
  }
}

const obfuscateFiles = async (filePath = "src", excludeFolders) => {
  try {
    let stat = fs.lstatSync(filePath);

    for (let index = 0; index < excludeFolders.length; index++) {
      excludeFolders[index] = excludeFolders[index].replace(/\\/g, '/');
    }

    if (stat.isFile()) {
      if (path.extname(filePath) != '.js') {
        console.log("Skipping ", filePath);
        return;
      }
      response = bytenode.compileFile({
        filename: filePath
      });
      fs.removeSync(filePath);
      console.log("Successfully encrypted : ", filePath);

    } else if (stat.isDirectory() && !excludeFolders.includes(filePath.replace(/\\/g, '/'))) {
      await obfuscateFilesInDirectory(filePath, excludeFolders);
    }
  } catch (e) {
    console.log("\nError in encrypting file", e);
  }
}

/**
 * @description
 * njs2 compile
 * */
const execute = async (CLI_KEYS, CLI_ARGS) => {
  try {
    if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
      throw new Error('njs2 compile (Run from plugin directory) root directory');

    const package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
    if (!(package_json['njs2-type'] == 'endpoint' || package_json['njs2-type'] == 'helper')) {
      throw new Error('njs2 compile (Run from plugin directory) root directory');
    }

    await getAWSConfig();

    // If sync remote is true, then get S3 bucket name
    if (syncRemote)
      await getS3BucketName();

    const child_process = require("child_process");
    if (!fs.existsSync('dist'))
      fs.mkdirSync("dist");
    else {
      // empty dist folder
      fs.emptyDirSync('dist');
    }

    // Check if pacage name exists, if yes delete the existing files and copy current folder contents to dist/compiled folder
    child_process.execSync(`if [ -e ./dist/${package_json.name}@${package_json.version}.tar.gz ];
      then rm -rf ./dist/${package_json.name}@${package_json.version}.tar.gz ;
      fi && rsync -r * ./dist/compiled`);

    if (encryptStatus) await obfuscateFiles(filePath, excludeFolders);

    // Compress the files to tar.gz and create build version files
    await tar.c(
      {
        C: 'dist/compiled',
        filter: (pathname => { return pathname != 'dist'; })
      },
      fs.readdirSync('./dist/compiled')
    ).pipe(fs.createWriteStream(`./dist/${package_json.version}.tar.gz`)).on('close', async () => {
      fs.rmdirSync('./dist/compiled', { recursive: true });
      child_process.execSync(`cp ./dist/${package_json.version}.tar.gz ./dist/latest.tar.gz`);
      console.log(`\nSuccessfully compiled in directory`, filePath);
      if (syncRemote) {
        await Promise.all([
          uploadFileToS3(`${PLUGIN_BASE_PATH}/${package_json.name}/${package_json.version}.tar.gz`, `./dist/${package_json.version}.tar.gz`),
          uploadFileToS3(`${PLUGIN_BASE_PATH}/${package_json.name}/latest.tar.gz`, `./dist/latest.tar.gz`)
        ]);
        console.log("\nSuccessfully uploaded to S3");
      }
    });
  } catch (e) {
    console.error(e);
  }
}

module.exports.execute = execute;