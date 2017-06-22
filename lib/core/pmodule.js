const pp        = require('./ppublish');
const pt        = require('./ptalk');
const utils     = require('../common/utils');
const fs        = require('fs');
const commander = require('commander');
const path      = require('path');

commander
    .option('-m --module <file>', 'specify a pjs file')
    .option('-s --server <String>', 'specify the server address')
    .parse(process.argv);

if (commander.module && commander.server) {
    console.log(commander.module, commander.server)
    fs.readFile(commander.module, function (err, data) {
        if (err) throw err;

        utils.rndPort().then((port) => {
            var addr = "tcp://127.0.0.1:" + port;
            data = JSON.parse(data);
            data.port = addr;

            pp.announce(data, commander.server);

            const dirname = path.dirname(commander.module);

            const imported = require(path.resolve(path.join(dirname, data.name)));
        
            pt(addr, function (name, params) {
                return imported[name](params);
            });

        }).catch((err) => {
            console.log(err)
        });
    });
}