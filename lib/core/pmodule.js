const pp        = require('./ppublish');
const pt        = require('./ptalk');
const utils     = require('../common/utils');
const fs        = require('fs');
const commander = require('commander');
const path      = require('path');
const { exec }  = require('child_process');

commander
    .option('-m --module <file>', 'specify a pjs file')
    .option('-s --server <String>', 'specify the server address')
    .parse(process.argv);

function findFiles(folder, extension, cb){
    folder = path.resolve(folder);

    var command = "";
    
    if(/^win/.test(process.platform)){
        command = `dir /B ${folder}\\*."${extension}`;
    } else{
        command = `ls -1 ${folder}/*.${extension}`;
    }
    
    exec(command, (err, stdout, stderr) => {
        if(err) return cb(err, null);
        //get rid of \r from windows
        stdout = stdout.replace(/\r/g,"");
        var files = stdout.split("\n");
        //remove last entry because it is empty
        files.splice(-1, 1);
        cb(err, files);
    });
}

if (commander.module && commander.server) {
    console.log(commander.module)
    fs.readFile(commander.module, (err, data) => {
        if (err) throw err;

        utils.rndPort().then((port) => {
            var addr = "tcp://127.0.0.1:" + port;
            data = JSON.parse(data);
            data.port = addr;

            pp.announce(data, commander.server);

            const moduleIndex = path.join(path.dirname(commander.module), data.file);
            const imported = require(path.resolve(moduleIndex));
            
            pt(addr, function (name, params) {
                return imported[name](params);
            });

        }).catch((err) => {
            console.log(err)
        });
    });
}