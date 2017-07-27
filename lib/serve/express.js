const express = require('express')
const app = express()

const rpc = require('axon-rpc');
const axon = require('axon');
const req = axon.socket('req');

const {
  RPC_PORT
} = require('../common/constraints');

var client = new rpc.Client(req);

req.connect(RPC_PORT);

app.get('/', function(req, res) {
  client.call('modules:list-json', function(err, n) {
    res.send(n);
  });
})

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})
