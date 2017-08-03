#!/usr/bin/env node

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

commander.command('module:start <dir>')
    .option('-s --server <String>', 'specify the server address')
    .option('-n --name <String>', 'specify the module name')
    .description('start a module instance')
    .action(function(cmd, options) {
        cli.startModule(cmd, options.name, options.server);
});

// TODO: should be directly
commander.command('module:stop')
    .option('-n --name <String>', 'specify the module name')
    .description('stop a module instance')
    .action(function(cmd) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        cli.stopModule(cmd.name);
});

commander.command('modules:list')
    .description('list a modules instance')
    .action(function(cmd) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        cli.listModules();
});

commander.parse(process.argv);

if (!commander.args.length) commander.help();