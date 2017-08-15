const rpc          = require('axon-rpc');
const axon         = require('axon');
const req          = axon.socket('req');
const fs           = require('fs');

const jsonfile     = require('jsonfile');

const { fork }     = require('child_process');
const { exec }     = require('child_process');
const { RPC_PORT } = require('./common/constraints'); 
const preferences  = require('./common/preferences')('state');
 
const client       = new rpc.Client(req);

req.connect(RPC_PORT);

module.exports = {
  startServer: function (port=3001) {
    client.call('server:start', port, function(err, n) {
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
    exec(`kill -9 ${preferences.get('rpcServer')}`);
    exec(`kill -9 ${preferences.get('webServer')}`);

    var rpc = fork(`${__dirname}/serve/rpc.js`);
    var web = fork(`${__dirname}/serve/web.js`);

    preferences.push('rpcServer', rpc.pid);
    preferences.push('webServer', web.pid);

    preferences.save((e) => {
      console.log('ok!');
      process.exit(0);
    });
  },

  serviceStop: function () {
    exec(`kill -9 ${preferences.get('rpcServer')}`);
    exec(`kill -9 ${preferences.get('webServer')}`);

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