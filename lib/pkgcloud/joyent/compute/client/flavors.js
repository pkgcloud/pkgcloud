/*
 * flavors.js: Implementation of Joyent Flavors Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
// ## Joyent Flavors Interface for pkgcloud
// 
// In joyent flavors are refered as packages. This is the pkgcloud wrapper 
// that exposes  the joyent API for managing flavors
//
var pkgcloud = require('../../../../../lib/pkgcloud'),
    smartdc  = require('smartdc'),
    compute  = pkgcloud.providers.joyent.compute;

// ### function getFlavor (details, callback) 
//
// Gets a specified flavor of Joyent Packages using the provided details
// object.
//
// #### @id {Object|String} an object literal with options, or simple the 
// id of the flavor
// ####     @name    {String}  String name of the package
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// ####     @account {String}  **Optional** The login name of the acct
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
// #### @throws {TypeError} On bad input
//
exports.getFlavor = function getFlavor(id, callback) {
  // accept just a string, use it as package name
  if(typeof id === 'string') { id = { name: id }; }
  // if it's a object we need to translate the api apropriately
  if(!(id && id.name)) 
    throw new TypeError('No Flavor name was provided');

  var self = this,
      cb   = function(err,result) {
        if(err) return callback(err);
        callback(null, new compute.Flavor(self, result));
      };

  if(id && id.account) {
    this.client.getPackage(id.name, id.account, cb, id.noCache);
  }
  else {
    this.client.getPackage(id.name, cb, id.noCache);
  }
};

// ### function getFlavors (details, callback) 
//
// Lists all flavors available to your account.
//
// #### @opts {Object|String} **Optional** An object literal 
// with joyent specific options.
// If this is a string then it must be the account name.
// ####     @account {String}  **Optional** The login name of the acct
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// #### @callback {function} f(err, flavors). `flavors` is an array that
// represents the flavors that are available to your account
// #### @throws {TypeError} On bad inputs
//
exports.getFlavors = function getFlavors(opts, callback) {

  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }
  if(typeof opts === 'string') { opts = { account: opts }; }

  var self = this,
      cb   = function(err,result) {
        if(err) return callback(err);
        callback(null,
          result.map(function (e) { return new compute.Flavor(self, e); }));
      };

  if(opts) {
    if(opts.account) {
      this.client.listPackages(opts.account, cb, opts.noCache);
    }
    else {
      this.client.listPackages(cb, opts.noCache);
    }
  } 
  else { this.client.listPackages(cb); }
};

// what is this again?
exports.getFlavorDetails = function getFlavorDetails(callback) {};