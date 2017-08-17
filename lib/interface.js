const rpc          = require('axon-rpc');
const axon         = require('axon');
const req          = axon.socket('req');
const fs           = require('fs');

const jsonfile     = require('jsonfile');

const { fork }     = require('child_process');
const { exec }     = require('child_process');
const { RPC_PORT } = require('./common/constraints'); 
const conf         = require('./common/config');
 
const client       = new rpc.Client(req);

req.connect(RPC_PORT);

module.exports = {
  startServer: function (port=3001) {
    client.call('server:start', port, function(err, n) {
      console.log('ok!');
      process.exit(0);
    })
  },

  stopServer: function () {
    client.call('server:stop', function(err, n) {
      console.log('ok!');
      process.exit(0);
    })
  },

  startModule: function (module, name, server="tcp://127.0.0.1:3001") {
    client.call('module:start', module, server, name, function(err, n) {
      console.log('ok!');
      process.exit(0);
    })
  },

  serviceStart: function () {
    exec(`kill -9 ${conf.get('servers.rpc.pid')}`);
    exec(`kill -9 ${conf.get('servers.web.pid')}`);

    var rpc = fork(`${__dirname}/serve/rpc.js`);
    var web = fork(`${__dirname}/serve/web.js`);

    conf.set('servers.rpc', { 
      port: RPC_PORT,
      pid: rpc.pid
    });

    conf.set('servers.web', {
      port: 3000,
      pid: web.pid
    });

    console.log('Ok!');
    process.exit(0);
  },

  serviceStop: function () {
    exec(`kill -9 ${conf.get('servers.rpc.pid')}`);
    exec(`kill -9 ${conf.get('servers.web.pid')}`);

    console.log('ok!');
    process.exit(0);
  },

  stopModule: function (name) {
    client.call('module:stop', name, function(err, n){
      process.exit(0);
    })
  },

  listModules: function () {
    client.call('modules:list', function(err, n){
      console.log(n);
      process.exit(0);
    })
  }
}