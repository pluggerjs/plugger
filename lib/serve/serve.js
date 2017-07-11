const rpc          = require('axon-rpc')
const axon         = require('axon')
const rep          = axon.socket('rep');
const Table        = require('cli-table');
const colors       = require('colors/safe');

const { RPC_PORT } = require('../common/constraints'); 
const { fork }     = require('child_process');
const { spawn }    = require('child_process');
 
const server    = new rpc.Server(rep);
var modules     = {};

server.expose({
  'server:start': function(port, fn){
    fork(`${__dirname}/../core/pserver.js`, ['-p', port]);
    fn(null, 'done!');
  },

  'modules:list': function(fn){
    var table = new Table({
      head: [colors.bold.cyan('Name'), colors.bold.cyan('Pid')],
      colWidths: [30, 10],
    });

    var rows = [];
    var modulesKeys = Object.keys(modules);

    for (var i = 0; i < modulesKeys.length; i++) {
      table.push([modulesKeys[i], modules[modulesKeys[i]]])
    }

    fn(null, table.toString());
  },

  'module:start': function(module, server, name, fn){
    if (!name) {
      name = 'module_' + (Object.keys(modules).length + 1);
    }

    // TODO name must be unique
    var pid = fork(`${__dirname}/../core/pmodule.js`, ['-m', module, '-s', server]).pid;
    modules[name] = pid;

    fn(null, 'done!');
  },

  'module:stop': function(name, fn){
    spawn('kill', ['-9', modules[name]]);
    fn(null, 'done!');
  }
});

rep.bind(RPC_PORT, () => {
  console.log(`Server listening on port ${RPC_PORT}!`)
});
