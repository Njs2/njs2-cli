const child_process = require("child_process");

const run = async (CLI_KEYS, CLI_ARGS) => {
  await require('./update-postman').updatePostman();
  child_process.execSync('npm run lint', { stdio: 'inherit' });
  // Option to skip cms build
  // if (!Object.keys(CLI_KEYS).includes('skip-cms-build'))
  //   child_process.execSync(`cd cms && npm run build`, { stdio: 'inherit' });

  if (CLI_ARGS[0] == 'serverless') {
    child_process.execSync('sls offline start', { stdio: 'inherit' });
  } else {
    child_process.execSync('node express.js', { stdio: 'inherit' });
  }
}

module.exports.run = run;