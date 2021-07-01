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

if (Object.keys(CLI_KEYS)[0] == 'help') {
  console.log(`njs2 plugin <package-name>
njs2 compile (Run from plugin directory)
njs2 project <project-name>
njs2 endpoint <endpoint-name>
njs2 update-postman`);
} else {
  switch (CMD) {
    case 'plugin':
      // Install plugins to project
      require('./helper/install').install(CLI_KEYS, CLI_ARGS);
      break;

    case 'compile':
      // Complie plugins and create build
      require('./helper/compile-package').compile();
      break;

    case 'project':
      // Create new project
      require('./helper/new-project').createProject(CLI_KEYS, CLI_ARGS);
      break;

    case 'endpoint':
      // Create new endpoint
      require('./helper/create-endpoint').createEndpoint(CLI_KEYS, CLI_ARGS);
      break;

    case 'update-postman':
      require('./helper/update-postman').updatePostman();
      break;

    case 'run':
      require('./helper/run').run(CLI_KEYS, CLI_ARGS);
      break;

    default:
      console.log(`Invalid cmd and options:
      njs2 plugin <package-name>
      njs2 compile (Run from plugin directory)
      njs2 project <project-name>
      njs2 endpoint <endpoint-name>
      njs2 update-postman`);
      break;
  }
}
