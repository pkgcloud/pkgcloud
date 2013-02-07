/*
 * keys.js Implementation of OpenStack KeyPair API
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

//
// ### function listKeys(callback)
//
// Lists keypairs that are currently stored
//
// @callback {Function} f(err, keypairs)
//
exports.listKeys = function listKeys (callback) {
  return this.request('os-keypairs', callback, function (body, res) {
    callback(null, body.keypairs, res);
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
exports.addKey = function addKey (options, callback) {
  if (typeof options === 'string') {
    var name = options;
    options = {};
    options.name = name;
  }

  var self = this,
      createOptions = {
        method: 'POST',
        path: 'os-keypairs',
        body: { keypair: options }
      }
  return this.request(createOptions, callback, function (body, res) {
    callback(null, body.keypair, res);
  });
};

//
// ### function destroyKey(name, callback)
// #### @name {String} Name of Key pair
// #### @callback {Function} f(err, name);
//
// Delete a keypair by name
//
exports.destroyKey = function destroyKey (name, callback) {
  var deleteOptions = {
    method: 'DELETE',
    path: 'os-keypairs/' + name
  };

  return this.request(deleteOptions, callback, function (body, res) {
    callback(null, {ok: name}, res);
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
  return this.request('os-keypairs/' + name, callback, function (body, res) {
    callback(null, body.keypair, res);
  });
};
