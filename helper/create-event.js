#!/usr/bin/env node
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const createEvent = async (CLI_KEYS, CLI_ARGS) => {
  if (!fs.existsSync(`${path.resolve(process.cwd(), `package.json`)}`))
    throw new Error('njs2 socket <event-name> to be run from project root directory');

  const package_json = require(`${path.resolve(process.cwd(), `package.json`)}`);
  if (package_json['njs2-type'] != 'project') {
    throw new Error('njs2 socket <event-name> to be run from project root directory');
  }

  if (!CLI_ARGS[0] || CLI_ARGS[0].length == 0) {
    throw new Error('Event-name is mandatory parameter');
  }

  try {
    const handlerName = CLI_ARGS[0].split("_").map((val, index) => index > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val).join('');
    const EVENT_PATH = `src/events/${handlerName}Handler.js`;
    if (fs.existsSync(EVENT_PATH)) {
      throw new Error(`Event already exists: ${EVENT_PATH}`);
    }

    const templateContent = fs.readFileSync(path.resolve(process.cwd(), `node_modules/njs2-base/package/template/eventStructure/eventHandler.js`), 'utf8');
    fs.writeFileSync(path.resolve(process.cwd(), EVENT_PATH), templateContent);

    const listenerConfig = require(path.resolve(process.cwd(), `src/config/listener.json`));
    listenerConfig.push({
      "event": CLI_ARGS[0],
      "handler": `./${EVENT_PATH}`
    });
    fs.writeFileSync(path.resolve(process.cwd(), `src/config/listener.json`), JSON.stringify(listenerConfig, null, 2));
  } catch (e) {
    console.log(e);
  }
}

module.exports.createEvent = createEvent;