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
    compute  = pkgcloud.providers.joyent.compute;

// ### function getFlavor (details, callback) 
//
// Gets a specified flavor of Joyent Packages using the provided details
// object.
//
// #### @id {Object|String} an object literal with options, or simply the 
// id of the flavor
// ####     @name    {String}  String name of the package
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// ####     @account {String}  **Optional** The login name of the acct
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
//
exports.getFlavor = function getFlavor(id, callback) {
  var self = this;

  // accept just a string, use it as package name
  if(typeof id === 'string') { id = { name: id }; }
  // if it's a object we need to translate the api apropriately
  if(!(id && id.name)) 
    throw new TypeError('No Flavor name was provided');

  // joyent decided to add spaces to their identifiers
  id.name = encodeURIComponent(id.name);

  this.request(this.config.account + '/packages/' + id.name , callback,
    function (body) {
      try {
        callback(null, new compute.Flavor(self,body));
      } catch (e) { callback(e); }
  });
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
//
exports.getFlavors = function getFlavors(opts, callback) {
  var self = this;

  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }

  if(typeof opts === 'string') { opts = { account: opts }; }

  this.request(this.config.account + '/packages', callback, 
    function (body) {
      try {
        callback(null, body.map(function (result) {
          return new compute.Flavor(self, result);
        }));
      } catch (e) { callback(e); }
    });
};