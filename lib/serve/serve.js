const rpc          = require('axon-rpc')
const axon         = require('axon')
const rep          = axon.socket('rep');
const Table        = require('cli-table');
const colors       = require('colors/safe');

const { RPC_PORT } = require('../common/constraints'); 
const { fork }     = require('child_process');
const { spawn }    = require('child_process');
var sqlite3 = require('sqlite3').verbose();
var db      = new sqlite3.Database('../../plugger.db');
 
const server    = new rpc.Server(rep);
var modules     = {};

server.expose({
  'server:start': function(port, fn){
    db.serialize(() => {
      db.run("CREATE OR REPLACE TABLE module(id integer auto_increment primary key,"
      +" name varchar(50) not null, version varchar(10))");
      db.run("CREATE OR REPLACE TABLE server(serverId integer auto_increment primary key,"
      +" moduleId integer, foreign key(moduleId) references module(id));");
    });
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

    db.each("SELECT name, version FROM module WHERE name="+name, function(err, row) {
      if (err || !row) {
        var stmt = db.prepare("INSERT INTO module(name, version) VALUES (?, ?)");
        if (typeof module === 'object' && module.version !== 'undefined') {
          stmt.run(name, module.version)
        } else {
          stmt.run(name, "1.0.0");
        }
        stmt.finalize();
      }
    });

    fn(null, 'done!');
  },

  'module:stop': function(name, fn){
    db.close();
    spawn('kill', ['-9', modules[name]]);
    fn(null, 'done!');
  }
});

rep.bind(RPC_PORT, () => {
  console.log(`Server listening on port ${RPC_PORT}!`)
});
