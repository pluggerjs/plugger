const zmq       = require("zmq");
const uuid      = require('uuid/v4');
const log       = require('../common/utils').log;
const chalk     = require('chalk');
const semver    = require('semver');
const conf      = require('../common/config');

const commander = require('commander');

const NAME_SEPARATOR = '__';

class PServer {
  constructor (address) {
    this._services = {};
    this._clientsReqId = {};

    this._servicesSocket = zmq.socket('sub');

    this._servicesSocket.bindSync(address);
    this._servicesSocket.subscribe('service_notification');
    this._servicesSocket.on('message', this._onServiceMessage.bind(this));

    this._createServiceListen();
  }

  _getModuleInfo (reqName) {
    var ret = {
      module: undefined,
      version: undefined,
      service: undefined
    };

    var arr = reqName.split(NAME_SEPARATOR);
    
    ret.module = arr[0];
    
    if (ret.module.length === 3) {
      ret.name    = arr[0];
      ret.version = arr[1];
      ret.service = arr[2];
    } else {
      ret.name    = arr[0];
      ret.service = arr[1];
      ret.version = '0.0.0';

      var keys = Object.keys(this._services);

      for (var i = 0; i < keys.length; i++) {
        var service = this._services[keys[i]];
        var arr     = keys[i].split(NAME_SEPARATOR);

        if (arr[0] === ret.name && semver.gt(arr[1], ret.version)) {
          ret.version = arr[1];
        }
      }
    }

    return ret;
  }

  _createServiceListen () {
    var self = this;

    this.moduleRequest = zmq.socket("router");

    this.moduleRequest.bind('tcp://127.0.0.1:3008');

    // Add a callback for the event that is invoked when we receive a message.
    this.moduleRequest.on("message", function () {
      var args     = Array.apply(null, arguments);
      var identity = args[0];

      var request    = JSON.parse(args[2].toString('utf8'));
      var moduleInfo = self._getModuleInfo(request.name);
      var service    = self._services[`${moduleInfo.module}__${moduleInfo.version}`]; // all instances of modules

      if (service) {
        var reqId = uuid();
        self._clientsReqId[reqId] = identity;

        log(chalk.bold.blue('[module request]'), request.name, '|', reqId);
        log(chalk.bold.green('[module ' + request.name + ' on]'));

        service.send(JSON.stringify({name: moduleInfo.service, params: request.params,
          identity: reqId, options: request.options}));
      } else {
        log(chalk.bold.red('[module ' + request.name + ' off]'));

        self.moduleRequest.send(JSON.stringify({result: 'ok', options: request.options}));
      }
    });
  }

  _serviceRegistred (key) {
    return this._services[key];
  }

  _enableServiceMonitor (body, reply) {
    var self = this;

    reply.on('close', function () {
      log(chalk.bold.red('[module closed]'), body.name, ' version: ', body._v,
        '|', body.port);
      reply.unmonitor();
      delete self._services[body.name];
    });

    reply.monitor(500, 0);
  }

  _registerService (key, reply) {
    var self = this;

    this._services[key] = reply;

    // Module result response
    this._services[key].on('message', (data) => {
      var res = JSON.parse(data.toString('utf8'));

      if (res != 'LISTENING') {
        log(chalk.bold.white('[result]'), res.identity);

        self.moduleRequest.send([self._clientsReqId[res.identity],
          JSON.stringify({result: res.result, options: res.options})]);
      }
    });
  }

  _onServiceMessage (msg, msgBody) {
    var body = JSON.parse(msgBody.toString());
    var key = `${body.name}${NAME_SEPARATOR}${body._v}`;

    if (!this._serviceRegistred(key)) {
      var self = this;
      var reply = zmq.socket("rep");

      reply.connect(body.port);

      log(chalk.bold.green('[module discovered]'), body.name, 'version: ',
       body._v, '|', body.port);

      this._registerService(key, reply);
      this._enableServiceMonitor(body, reply);
    }
  }
}

commander
  .option('-p --port <number>', 'specify a port')
  .parse(process.argv);

new PServer(`tcp://127.0.0.1:${commander.port}`);
