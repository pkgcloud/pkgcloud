/*
 * keys.js Implementation of OpenStack KeyPair API
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

var urlJoin = require('url-join');

var _extension = 'os-keypairs';

//
// ### function listKeys(callback)
//
// Lists keypairs that are currently stored
//
// @callback {Function} f(err, keypairs)
//
exports.listKeys = function listKeys(callback) {
  return this.request({
    path: _extension
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.keypairs, res);
  });
};

//
// ### function addKey(options, callback)
//
// Generates or Imports a keypair (if key is supplied in request)
//
// #### @opts {Object|String} options or keypair name
// ####   @name {String} **Required** name of keypair
// ####   @public_key {String} **Optional**
// ####   @callback {Function} f(err, keypair).
//
exports.addKey = function addKey(options, callback) {
  if (typeof options === 'string') {
    options = { name: options };
  }
  else if (options.key) {
    options.public_key = options.key;
    delete options.key;
  }

  var self = this,
      createOptions;

  createOptions = {
    method: 'POST',
    path: _extension,
    body: { keypair: options }
  };

  return this.request(createOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.keypair, res);
  });
};

//
// ### function destroyKey(name, callback)
// #### @name {String} Name of Key pair
// #### @callback {Function} f(err, name);
//
// Delete a keypair by name
//
exports.destroyKey = function destroyKey(name, callback) {
  var deleteOptions = {
    method: 'DELETE',
    path: urlJoin(_extension, name)
  };

  return this.request(deleteOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, {ok: name}, res);
  });
};

//
// ### function getKey(name, callback)
// #### @name {String} Name of keypair to return
// #### @callback {Function} f(err, name).
//
// Get KeyPair based on name
//
exports.getKey = function getKey(name, callback) {
  return this.request({
    path: urlJoin(_extension, name)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.keypair, res);
  });
};
