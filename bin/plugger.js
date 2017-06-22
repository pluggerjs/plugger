const commander  = require('commander');
const pkg        = require('../package.json');
const cli        = require('../lib/interface');

commander.version(pkg.version)
  .option('-v --version', 'get version')
  .usage('[cmd] app');

commander.command('server:start')
    .option('-p --port <number>', 'specify a port')
    .description('start an server instance')
    .action(function(cmd) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        cli.startServer(cmd.port);
  });

commander.command('module:start')
    .option('-m --module <file>', 'specify a pjs file')
    .option('-s --server <String>', 'specify the server address')
    .option('-n --name <String>', 'specify the module name')
    .description('start an server instance')
    .action(function(cmd) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        cli.startModule(cmd.module, cmd.server, cmd.name);
});

commander.command('module:stop')
    .option('-n --name <String>', 'specify the module name')
    .description('start an server instance')
    .action(function(cmd) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        cli.stopModule(cmd.name);
});

commander.parse(process.argv);