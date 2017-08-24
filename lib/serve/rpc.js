const rpc           = require('axon-rpc')
const axon          = require('axon')
const rep           = axon.socket('rep');
const path          = require('path');
const Table         = require('cli-table');
const colors        = require('colors/safe');
const fs            = require('fs');

const { RPC_PORT }  = require('../common/constraints');
const conf          = require('../common/config');
const { fork }      = require('child_process');
const { spawn }     = require('child_process');

const BASE_DIR      = path.dirname(require.main.filename);

const server        = new rpc.Server(rep);
var modules = {};
var modulesJson = [];

server.expose({
  'server:start': function(port, fn) {
    let pid = fork(`${__dirname}/../core/pserver.js`, ['-p', port]).pid;

    conf.set('servers.pserver', {
      port: port,
      pid: pid
    });

    fn(null, 'done!');
  },

  'server:stop': function(fn) {
    let pid = conf.get(`servers.pserver.pid`);

    if (typeof pid == 'number') {
      spawn('kill', ['-9', pid]);
    }

    fn(null, 'done!');
  },

  'modules:list': function(fn) {
    var table = new Table({
      head: [colors.bold.cyan('Name'), colors.bold.cyan('Pid')],
      colWidths: [30, 10],
    });

    var rows = [];

    const modules = conf.get('modules');
    const modulesKeys = Object.keys(modules);

    for (var i = 0; i < modulesKeys.length; i++) {
      table.push([modulesKeys[i], modules[modulesKeys[i]].pid])
    }

    fn(null, table.toString());
  },

  'modules:list-json': function(fn) {
    const modules = conf.get('modules');

    fn(null, modules);
  },

  'module:start': function(module, server, name, fn) {
    const modulePath = path.join(process.cwd(), module);

    fs.readdir(modulePath, 'utf8', (err, data) => {
      data.forEach((fileName) => {
        if (fileName.indexOf('.pjs') > -1) {
          const pjsPath = path.join(modulePath, fileName);

          fs.readFile(pjsPath, 'utf8', (err, data) => {
            if (err) throw err;
            const conf = require('../common/config');
            const moduleData = JSON.parse(data);

            let moduleCount = conf.get('m_count') + 1;
            conf.set('m_count', moduleCount);

            // TODO name must be unique
            var pid = fork(`${__dirname}/../core/pmodule.js`, ['-m', pjsPath, '-s', server]).pid;
            
            conf.set(`modules.${moduleData.name}_${moduleCount}`, {
              name: moduleData.name,
              _v:   moduleData._v,
              path: modulePath,
              services: moduleData.services, 
              pid:  pid
            });
          });
        }
      });
    });

    fn(null, 'done!');
  },

  'module:stop': function(name, fn) {
    let modulePid = conf.get(`modules.${name}.pid`);

    if (typeof modulePid == 'number') {
      spawn('kill', ['-9', modulePid]);
    }

    conf.delete(`modules.${name}`);

    fn(null, 'done!');
  }
});

rep.bind(RPC_PORT, () => {
});
