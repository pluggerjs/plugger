const express     = require('express')
const bodyParser  = require('body-parser');
var cors          = require('cors');
const rpc         = require('axon-rpc');
const axon        = require('axon');
const req         = axon.socket('req');

const app         = express();

app.use(cors());

const { RPC_PORT } = require('../common/constraints');

var client = new rpc.Client(req);

req.connect(RPC_PORT);

app.get('/modules', function(req, res) {
  client.call('modules:list-json', function(err, n) {
    res.json(n);
  });
})

app.use('*', function (req, res, next) {
  var origin = req.get('origin');

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function() {

})
