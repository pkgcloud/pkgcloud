var assert = module.exports = require('assert');

assert.assertFlavor = function assertFlavor(instance) {
  assert.equal(instance.constructor.name, 'Flavor');
};

assert.assertFlavorDetails = function assertFlavorDetails(instance) {
  assert.equal(instance.constructor.name, 'Flavor');
};

assert.assertServer = function assertServer(instance) {
  assert.equal(instance.constructor.name, 'Server');
};

assert.assertServerDetails = function assertServerDetails(instance) {
  assert.equal(instance.constructor.name, 'Server');
};

assert.assertImage = function assertImage(instance) {
  assert.equal(instance.constructor.name, 'Image');
};

assert.assertImageDetails = function assertImageDetails(instance) {
  assert.equal(instance.constructor.name, 'Image');
};

assert.assertContainer = function assertContainer(instance) {
  assert.equal(instance.constructor.name, 'Container');
};
