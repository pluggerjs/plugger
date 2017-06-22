var rpc = require('axon-rpc')
  , axon = require('axon')
  , rep = axon.socket('rep');

const { fork } = require('child_process');
const { spawn } = require('child_process');
 
var server = new rpc.Server(rep);
rep.bind(4000);

var modules = {};

server.expose({
    'server:start': function(port, fn){
        fork(`${__dirname}/../core/pserver.js`, ['-p', port]);
        fn(null, 'done!');
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