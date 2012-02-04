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
    compute  = pkgcloud.providers.rackspace.compute;

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
function getFlavor(id, callback) {
  // accept just a string, use it as package name
  if(typeof id === 'string') { id = { name: id }; }
  // if it's a object we need to translate the api apropriately
  if(!(id && id.name)) 
    throw new TypeError('No Flavor name was provided');
  // need to check this with @indexzero as this is not my style and I need
  // to learn the coding guidelines he follows
  if(id && id.account)
    this.client.getPackage(id.name, id.account, callback, id.noCache);
  else
    this.client.getPackage(id.name, callback, id.noCache);
}

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
function getFlavors(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }
  if(typeof opts === 'string') { opts = { account: opts }; }
  if(opts) {
    if(opts.account) 
      this.client.listPackages(opts.account, callback, opts.noCache);
    else
      this.client.listPackages(callback, opts.noCache);
  } else this.client.listPackages(callback);
}

// what is this again?
exports.getFlavorDetails = function getFlavorDetails(callback) {};

exports = { getFlavor  : getFlavor,
            getFlavors : getFlavors
          };