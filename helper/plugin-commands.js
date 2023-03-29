

const execute = async (CLI_KEYS, CLI_ARGS) => {

  const CMD = CLI_ARGS[0];

  switch(CMD) {      
    case "compile":
      require("./compile-all-plugin").execute(CLI_KEYS, CLI_ARGS);
      break;
    
    case "install":
      require("./install-plugin").execute(CLI_KEYS, CLI_ARGS);
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