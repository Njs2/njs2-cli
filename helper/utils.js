const AWS = require('aws-sdk');

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