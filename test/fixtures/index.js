var fixtures = exports,
    assert = require('assert'),
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

fixtures.assertFlavor = function assertFlavor(instance) {
  assert.equal(instance.constructor.name, 'Flavor');
};

fixtures.assertFlavorDetails = function assertFlavorDetails(instance) {
  assert.equal(instance.constructor.name, 'Flavor');
};
