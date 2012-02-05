var fs = require('fs'),
    path = require('path'),
    pkgcloud = require('../../lib/pkgcloud');

var helpers = exports;

helpers.createClient = function createClient(provider, service, config) {
  config = config || helpers.loadConfig(provider);
  config.provider = provider;
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