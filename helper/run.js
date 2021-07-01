const child_process = require("child_process");

const run = async (CLI_KEYS, CLI_ARGS) => {
  if(CLI_ARGS[0] == 'serverless') {
    child_process.execSync('sls offline start', { stdio: 'inherit' });
  } else {
    child_process.execSync('node express.js', { stdio: 'inherit' });
  }
}

module.exports.run = run;