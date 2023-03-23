

const execute = async (CLI_KEYS, CLI_ARGS) => {

  const CMD = CLI_ARGS[0];
  console.log({CLI_ARGS});

  // CLI_ARGS = CLI_ARGS.slice(1);

  switch(CMD) {      
    case "compile":
      require("./compile-all-plugin").execute(CLI_KEYS, CLI_ARGS);
      break;
    
    case "install":
      require("./install-private-plugin").execute(CLI_KEYS, CLI_ARGS);
      break;

    case "uninstall":
      require("./uninstall-plugin").execute(CLI_KEYS, CLI_ARGS);
      break;

    default:
      require("./create-plugin").execute(CLI_KEYS, CLI_ARGS);
      break;
  }
}

module.exports.execute = execute;