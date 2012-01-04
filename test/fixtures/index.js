var fixtures = exports,
    pkgcloud = require('../../lib/pkgcloud');

var fs = require('fs'),
    path = require('path');

fixtures.createClient = function createClient(provider, service) {
  var config = fixtures.loadConfig(provider);
  config.provider = provider;

  return pkgcloud[service].createClient(config);
};

fixtures.loadConfig = function loadConfig(provider) {
  var content = fs.readFileSync(path.join(
      __dirname,
      '../configs/',
      provider + '.json'
  ));

  return JSON.parse(content.toString());
};
