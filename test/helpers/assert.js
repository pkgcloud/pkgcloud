var assert = module.exports = require('assert');

assert.assertFlavor = function assertFlavor(instance) {
  assert.isNumber(instance.id);
  assert.isString(instance.name);
  assert.equal(instance.constructor.name, 'Flavor');
};

assert.assertFlavorDetails = function assertFlavorDetails(instance) {
  assert.isNumber(instance.id);
  assert.isString(instance.name);
  assert.isNumber(instance.ram);
  assert.isString(instance.href);
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

assert.assertFile = function assertFile(instance) {
  assert.equal(instance.constructor.name, 'File');
};

assert.assertNock = function assertNock(nock) {
  return assert.ok(nock && nock.isDone ? nock.isDone() : true);
};

assert.assertInstance = function assertInstance (instance) {
  assert.ok(instance.id);
  assert.isString(instance.name);
  assert.isArray(instance.links);
  assert.isString(instance.status);
};
