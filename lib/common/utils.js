const random_port = require('random-port');

function rndPort () {
  return new Promise((resolve) => {
    random_port({from: 20000}, (port) => {
      resolve(port);
    });
  });
}

function log (...params) {
  console.log("[" + new Date().toLocaleTimeString() + "] " + params.join(' '));
}

module.exports.rndPort = rndPort;
module.exports.log = log;
