const rpc           = require('axon-rpc')
const axon          = require('axon')
const rep           = axon.socket('rep');
const path          = require('path');
const Table         = require('cli-table');
const colors        = require('colors/safe');
const fs            = require('fs');

const { RPC_PORT }  = require('../common/constraints');
const { fork }      = require('child_process');
const { spawn }     = require('child_process');

const BASE_DIR      = path.dirname(require.main.filename);

const server        = new rpc.Server(rep);
var modules = {};
var modulesJson = [];

server.expose({
  'server:start': function(port, fn) {
    fork(`${__dirname}/../core/pserver.js`, ['-p', port]);
    fn(null, 'done!');
  },

  'modules:list': function(fn) {
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

  'modules:list-json': function(fn) {
    fn(null, modulesJson);
  },

  'module:start': function(module, server, name, fn) {
    const modulePath = path.join(process.cwd(), module);

    fs.readdir(modulePath, 'utf8', (err, data) => {
      data.forEach((fileName) => {
        if (fileName.indexOf('.pjs') > -1) {
          fs.readFile(path.join(modulePath, fileName), 'utf8', (err, data) => {
            if (err) throw err;
            modulesJson.push(JSON.parse(data));
          });
        }
      })
    })

    if (!name) {
      name = 'module_' + (Object.keys(modules).length + 1);
    }

    // TODO name must be unique
    var pid = fork(`${__dirname}/../core/pmodule.js`, ['-m', module, '-s', server]).pid;
    modules[name] = pid;

    fn(null, 'done!');
  },

  'module:stop': function(name, fn) {
    spawn('kill', ['-9', modules[name]]);
    fn(null, 'done!');
  }
});

rep.bind(RPC_PORT, () => {
});
