const zmq       = require("zmq");
const uuid      = require('uuid/v4');
const log       = require('../common/utils').log;
const chalk     = require('chalk');
const semver    = require('semver');

const commander = require('commander');

const NAME_SEPARATOR = '__';

class PServer {
  constructor (address) {
    this._services = {};
    this._connections = {};

    this._servicesSocket = zmq.socket('sub');

    this._servicesSocket.bindSync(address);
    this._servicesSocket.subscribe('service_notification');
    this._servicesSocket.on('message', this._onServiceMessage.bind(this));

    this._createServiceListen();
  }

  _createServiceListen () {
    var self = this;

    this.replySocket = zmq.socket("router");

    this.replySocket.bind('tcp://127.0.0.1:3008');

    // Add a callback for the event that is invoked when we receive a message.
    this.replySocket.on("message", function () {
      var args = Array.apply(null, arguments)
        , identity = args[0]
        , now = Date.now();

        var objectId = uuid();

        var request = JSON.parse(args[2].toString('utf8'));

        // 'app__2.0.0__primo'

        var modulo = request.name.split(NAME_SEPARATOR); // 'primo__2.0.0__ehPrimo' in list
        var name = modulo[0];
        var version = undefined;
        var s = undefined;
        var service = undefined;
        
        if (modulo.length === 3) {
          // Has the version
          version = modulo[1];
          s = modulo[2];
        } else {
          s = modulo[1];
          version = '0.0.0';

          Object.keys(self._services).forEach((instance) => {
            var m = instance.split(NAME_SEPARATOR);
 
            if (m[0] === name && semver.gt(m[1], version)) {
              version = m[1];
            }
          });
        }

        service = self._services[`${name}__${version}`]; // all instances of modules

        log(chalk.bold.blue('[module request]'), request.name, '|', objectId);
        log(!!service ? chalk.bold.green('[module ' + request.name + ' on]') : chalk.bold.red('[module ' + request.name + ' off]'));

        self._connections[objectId] = identity;

        if (service) {
          service.send(JSON.stringify({name: s, params: request.params,
            identity: objectId, options: request.options}));
        } else {
          self.replySocket.send(JSON.stringify({result: 'ok', options: request.options}));
        }
    });
  }

  _onServiceMessage (msg, msgBody) {
    var body = JSON.parse(msgBody.toString());

    var key = `${body.name}${NAME_SEPARATOR}${body._v}`;

    if (!this._services[key]) {
      var reply = zmq.socket("rep");

      log(chalk.bold.green('[module discovered]'), body.name, 'version: ',
       body._v, '|', body.port);

      var self = this;

      this._services[key] = reply;

      reply.connect(body.port);

      this._services[key].on('message', (r) => {
        var res = JSON.parse(r.toString('utf8'));

        if (res != 'LISTENING') {
          log(chalk.bold.white('[result]'), res.identity);

          self.replySocket.send([this._connections[res.identity], JSON.stringify({result: res.result, options: res.options})]);
        }
      });

      var self = this;

      reply.on('close', function () {
        log(chalk.bold.red('[module closed]'), body.name, ' version: ', body._v,
         '|', body.port);
        reply.unmonitor();
        delete self._services[body.name];
      });

      reply.monitor(500, 0);
    }
  }
}

commander
  .option('-p --port <number>', 'specify a port')
  .parse(process.argv);

new PServer(`tcp://127.0.0.1:${commander.port}`);
