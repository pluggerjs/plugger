var zmq = require('zmq');

class PPublish {
  constructor (properties, serverAddress) {
    this._properties = Buffer.from(JSON.stringify(properties), 'utf8');

    this._sock = zmq.socket('pub');
    this._sock.connect(serverAddress);
  }

  announce (interval = 500) {
    var self = this;

    setInterval(function() {
      self._sock.send(['service_notification', self._properties]);
    }, interval);
  }
}

module.exports.announce = function (properties, server) {
  new PPublish(properties, server).announce();
};

