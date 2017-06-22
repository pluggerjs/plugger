var plugger = require('../lib/core/pcore')("tcp://127.0.0.1:4500");

setInterval(() => {
  plugger.exec('hello__dobra', 0).then((value) => {
    console.log(value);
  }).catch((error) => {
    console.log(error);
  });
}, 700);


setInterval(() => {
  plugger.exec('world__ping').then((value) => {
    console.log(value);
  });
}, 300);

setInterval(() => {
  plugger.exec('primo__1.0.0__ehPrimo', 7568).then((value) => {
    console.log(value);
  });
}, 300);

setInterval(() => {
  plugger.exec('primo__2.0.0__ehPrimo', 144547).then((value) => {
    console.log(value);
  });
}, 300);
