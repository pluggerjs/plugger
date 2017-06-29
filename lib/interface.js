var rpc = require('axon-rpc')
  , axon = require('axon')
  , req = axon.socket('req');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database(':memory:');
 
var client = new rpc.Client(req);
req.connect(4000);

module.exports = {
    startServer: function (port=3001) {
        client.call('server:start', port, function(err, n){
            process.exit(0);
        })
    },

    startModule: function (module, name, server="tcp://127.0.0.1:3001") {
        db.serialize(() => {
            var stmt = db.prepare("INSERT INTO module(name, version) VALUES (?, ?)");
            if (typeof module === 'object' && module.version !== 'undefined') {
                stmt.run(name, module.version)
            } else {
                stmt.run(name, "1.0.0");
            }
            stmt.finalize();
        });
        client.call('module:start', module, server, name, function(err, n){
            process.exit(0);
        })
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