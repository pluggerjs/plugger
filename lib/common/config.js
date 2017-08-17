const Configstore = require('configstore');
const pkg         = require('../../package.json');
 
const conf        = new Configstore(pkg.name, {
  server: undefined,
  modules: {},
  m_count: 0
}, {globalConfigPath: true});

module.exports = conf;
