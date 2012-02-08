var fs = require('fs'),
    path = require('path'),
    pkgcloud = require('../../lib/pkgcloud');

var helpers = exports;

helpers.createClient = function createClient(provider, service, config) {
  config = config || helpers.loadConfig(provider);
  config.provider = provider;

  // use your key for testing, so our credentials dont need to go in the repo
  if(provider === 'joyent') {
    if(!config.username) {
      if (!config.account)
        config.account = process.env.SDC_CLI_ACCOUNT;

      if (!config.identity) {
        if (process.env.SDC_CLI_IDENTITY) {
          config.identity = process.env.SDC_CLI_IDENTITY;
        } else {
          config.identity = process.env.HOME + '/.ssh/id_rsa';
        }
      }

      if (!config.keyId) {
        if (process.env.SDC_CLI_KEY_ID) {
          config.keyId = process.env.SDC_CLI_KEY_ID;
        } else {
          config.keyId = 'id_rsa';
        }
      }
      
      if(config.account) {
        config.keyId = '/' + config.account + '/keys/' + config.keyId;
        config.key   = fs.readFileSync(config.identity,'ascii');
      } else {
        throw new Error("Can't test without username and account");
      }
    }
  }
  return pkgcloud[service].createClient(config);
};

helpers.loadConfig = function loadConfig(provider) {
  var content = fs.readFileSync(path.join(
      __dirname,
      '../configs/',
      provider + '.json'
  ), 'utf8');

  return JSON.parse(content);
};