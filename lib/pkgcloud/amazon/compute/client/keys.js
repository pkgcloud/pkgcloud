/*
 * keys.js: Implementation of AWS SSH keys Client.
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var errs  = require('errs');

//
// ### function listKeys (options, callback)
// #### @options {Object} **Optional** Filter parameters when listing keys
// #### @callback {function} Continuation to respond to when complete.
//
// Lists all EC2 Key Pairs matching the specified `options`.
//
exports.listKeys = function (options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this,
    requestOpts = {};

  options = options || {};

  if (options.keyNames) {
    requestOpts.KeyNames = options.keyNames;
  }

  self.ec2.describeKeyPairs(requestOpts, function(err, data) {
    return err
      ? callback(err)
      : callback(err, data.KeyPairs);
  });
};

//
// ### function getKey (name, callback)
// #### @name {string} Name of the EC2 key pair to get
// #### @callback {function} Continuation to respond to when complete.
//
// Gets the details of the EC2 Key Pair with the specified `name`.
//
exports.getKey = function (name, callback) {
  return this.listKeys({
    keyNames: [ name ]
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body[0]);
  });
};

//
// ### function addKey (options, callback)
// #### @options {Object} SSH Public Key details
// ####     @name {string} String name of the key
// ####     @key  {string} SSH Public Key
// #### @callback {function} Continuation to respond to when complete.
//
// Adds an EC2 Key Pair with the specified `options`.
//
exports.addKey = function (options, callback) {
  if (!options || !options.key || !options.name) {
    return errs.handle(
      errs.create({ message: '`key` and `name` are required options.' }),
      callback
    );
  }

  this.ec2.importKeyPair({
    KeyName: options.name,
    PublicKeyMaterial: new Buffer(options.key).toString('base64')
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

//
// ### function destroyKey (name, callback)
// #### @name {string} Name of the EC2 key pair to destroy
// #### @callback {function} Continuation to respond to when complete.
//
// Destroys EC2 Key Pair with the specified `name`.
//
exports.destroyKey = function (name, callback) {
  this.ec2.deleteKeyPair({
    KeyName: name
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};
