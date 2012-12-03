var assert = module.exports = require('assert');

assert.assertFlavor = function assertFlavor(flavor) {
  assert.ok(flavor.id);
  assert.isString(flavor.name);
  assert.equal(flavor.constructor.name, 'Flavor');
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

assert.assertInstance = function assertInstance(instance) {
  assert.ok(instance.id);
  assert.isString(instance.name);
  assert.isArray(instance.links);
  assert.isString(instance.status);
};

assert.assertUser = function assertUser(user) {
  assert.ok(user);
  assert.isString(user.name);
  assert.equal(user.constructor.name, 'User');
};

assert.assertError = function assertEror(error, param) {
  assert.ok(error);
  assert.isObject(error);
  assert.isUndefined(param);
};
