/*
 * keys.js: Implementation of DigitalOcean SSH keys Client.
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var errs  = require('errs'),
    urlJoin = require('url-join');

//
// ### function listKeys (callback)
// #### @callback {function} Continuation to respond to when complete.
//
// Lists all DigitalOcean SSH Keys matching the specified `options`.
//
exports.listKeys = function (callback) {
  return this._request({
    path: '/v2/account/keys'
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.ssh_keys);
  });
};

//
// ### function getKey (id, callback)
// #### @id {int} Name of the DigitalOcean SSH key to get
// #### @callback {function} Continuation to respond to when complete.
//
// Gets the details of the DigitalOcean SSH Key with the specified `id`.
//
exports.getKey = function (id, callback) {
  return this._request({
    path: urlJoin('/v2/account/keys', id)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.ssh_key);
  });
};

//
// ### function addKey (options, callback)
// #### @options {Object} SSH Public Key details
// ####     @name {string} String name of the key
// ####     @key  {string} SSH Public Key
// #### @callback {function} Continuation to respond to when complete.
//
// Adds a DigitalOcean SSH Key with the specified `options`.
//
exports.addKey = function (options, callback) {
  if (!options || !options.key || !options.name) {
    return errs.handle(
      errs.create({ message: '`key` and `name` are required options.' }),
      callback
    );
  }

  return this._request({
    path: '/v2/account/keys',
    method: 'POST',
    body: {
      name: options.name,
      ssh_pub_key: options.key
    }
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

//
// ### function getKey (name, callback)
// #### @id {int} Name of the DigitalOcean SSH key to destroy
// #### @callback {function} Continuation to respond to when complete.
//
// Destroys DigitalOcean SSH Key with the specified `id`.
//
exports.destroyKey = function (id, callback) {
  return this._request({
    path: urlJoin('/v2/account/keys', id),
    method: 'DELETE',
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};
