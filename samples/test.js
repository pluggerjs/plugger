var plugger = require('../lib/core/pcore')("tcp://127.0.0.1:4500");

setInterval(() => {
  plugger.exec('hello__dobra', 84).then((value) => {
    console.log(value);
  }).catch((error) => {
    console.log(error);
  });
}, 100);
