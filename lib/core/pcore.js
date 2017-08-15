const zmq = require("zmq");
const utils = require('../common/utils');
const uuid = require('uuid/v4');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

class Plugger {
  constructor(serverAddr) {
    this._orders = {};
    this._id = uuid();

    this._requestSocket = zmq.socket('dealer');

    this._connect(serverAddr);
  }

  _connect(serverAddr) {
    var self = this;

    utils.rndPort().then((port) => {
      var addr = "tcp://*:" + port;

      this._requestSocket.identity = uuid();

      self._requestSocket.connect("tcp://127.0.0.1:" + 3008, function(error) {
        if (error) {
          self._logToConsole("Failed to bind socket: " + error.message);
          process.exit(0);
        } else {
          self._logToConsole("Server listening on port " + port);
        }
      });

      this._requestSocket.on('message', self._onRequestSocketMessage.bind(self));
    }).catch((err) => console.log(err));
  }

  _onRequestSocketMessage(msg, body) {
    var args = Array.apply(null, arguments);
    var response = JSON.parse(decoder.write(args[0]));
    // se o erro for um array pode ser verificado com includes como abaixo.
    //response.result.includes('Erro')
    //considerando uma string podemos fazer assim.
    
    if (typeof response.result == 'string' && response.result.indexOf('Erro') > -1) {
      return this._orders[response.options.orderId][1](response.result);
    } else {
      this._orders[response.options.orderId][0](response.result);
      delete this._orders[response.options.orderId];
    }
  }

  _logToConsole(message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
  }

  _sendMessage(msg) {
    //console.log(JSON.stringify(msg))
    this._requestSocket.send(['', JSON.stringify(msg)]);
  }

  exec(name, params) {
    var self = this;

    function executePromise() {
      return new Promise((resolve, reject) => {
        var orderId = uuid();

        var options = {
          orderId: orderId
        };

        self._orders[orderId] = [resolve, reject];

        self._sendMessage({
          name: name,
          params: params,
          options: options
        });
      });
    }

    return executePromise();
  }
}

module.exports = function(serverAddr) {
  return new Plugger(serverAddr);
};
