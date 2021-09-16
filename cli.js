#!/usr/bin/env node
let CLI_KEYS = {};
let CLI_ARGS = [];
for (let i = 0; i < process.argv.slice(2).length; i++) {
  if (process.argv.slice(2)[i].split('--').length > 1) {
    CLI_KEYS[process.argv.slice(2)[i].split('--')[1]] = process.argv.slice(2)[i + 1];
    i++;
  } else {
    CLI_ARGS.push(process.argv.slice(2)[i]);
  }
}

const CMD = CLI_ARGS[0];
CLI_ARGS = CLI_ARGS.slice(1);
switch (CMD) {
  case 'project':
    // Create new project
    require('./helper/new-project').execute(CLI_KEYS, CLI_ARGS);
    break;

  case 'endpoint':
    // Create new endpoint
    require('./helper/create-endpoint').execute(CLI_KEYS, CLI_ARGS);
    break;

  case 'run':
    require('./helper/run').execute(CLI_KEYS, CLI_ARGS);
    break;

  case 'package':
    // Install packages to project
    require('./helper/install-package').execute(CLI_KEYS, CLI_ARGS);
    break;

  case 'rm-package':
    require('./helper/rm-package').execute(CLI_KEYS, CLI_ARGS);
    break;

  case 'compile':
    // Complie packages and create build
    require('./helper/compile-package').execute(CLI_KEYS, CLI_ARGS);
    break;

  // create package
  case 'create-package':
    require('./helper/create-package').execute(CLI_KEYS, CLI_ARGS);
    break;

  //TODO
  case 'help':
    console.log(`
njs2 project <project-name>
njs2 endpoint <endpoint-name>
njs2 run serverless
njs2 run express
njs2 run nodemon
njs2 package  <package-name>
njs2 rm-package <package-name>
njs2 compile
njs2 create-package <package-name>`);
    break;

  default:
    console.log(`
njs2 project <project-name>
njs2 endpoint <endpoint-name>
njs2 run serverless
njs2 run express
njs2 run nodemon
njs2 package  <package-name>
njs2 rm-package <package-name>
njs2 compile
njs2 create-package <package-name>`);
    break;
}
