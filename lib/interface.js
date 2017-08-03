const rpc          = require('axon-rpc');
const axon         = require('axon');
const req          = axon.socket('req');
const fs           = require('fs');

const jsonfile     = require('jsonfile');

const { fork }     = require('child_process');
const { exec }     = require('child_process');
const { RPC_PORT } = require('./common/constraints'); 
 
var client         = new rpc.Client(req);

var myObject       = {};
var tmpDir         = require('os').homedir() + '/.plugger';
var file           = tmpDir + '/state.json';

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
  jsonfile.writeFileSync(file, myObject);
} else {
  if (!fs.existsSync(file)) {
    jsonfile.writeFileSync(file, myObject);
  } else {
    myObject = jsonfile.readFileSync(file);
  }
}

req.connect(RPC_PORT);

module.exports = {
  startServer: function (port=3001) {
    client.call('server:start', port, function(err, n) {
      process.exit(0);
    })
  },

  startModule: function (module, name, server="tcp://127.0.0.1:3001") {
    client.call('module:start', module, server, name, function(err, n) {
      process.exit(0);
    })
  },

  run: function () {
    console.log('ok')
    exec(`kill -9 ${myObject.rpcServer}`);

    var proc = fork(`${__dirname}/serve/serve.js`);

    myObject.rpcServer = proc.pid;

    jsonfile.writeFile(file, myObject, {spaces: 2}, (e) => {
      process.exit(0);
    });
  },

  stop: function () {
    exec(`kill -9 ${myObject.rpcServer}`);
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