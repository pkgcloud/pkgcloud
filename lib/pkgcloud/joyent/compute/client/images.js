/*
 * images.js: Implementation of Joyent Images Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
// ## Joyent Images Interface for pkgcloud
// 
// In joyent images are refered as DataSets. This is the pkgcloud wrapper 
// that exposes the joyent API for managing images
//
var pkgcloud = require('../../../../../lib/pkgcloud'),
    compute  = pkgcloud.providers.rackspace.compute;

// ### function getImages (opts, callback) 
//
// Lists all images available to your account.
//
// #### @opts {Object|String} **Optional** An object literal 
// with joyent specific options.
// If this is a string then it must be the account name.
// ####     @account {String}  **Optional** The login name of the acct
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
// #### @throws {TypeError} On bad inputs
//
exports.getImages = function (opts,callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts     = {};
  }
  if(typeof opts === 'string') { opts = { account: opts }; }

  var self = this,
      cb   = function(err,result) {
        if(err) return callback(err);
        callback(null,
          result.map(function (e) { return new compute.Image(self, e); }));
      };

  if(opts) {
    if(opts.account) {
      this.client.listDatasets(opts.account, cb, opts.noCache);
    }
    else {
      this.client.listDatasets(cb, opts.noCache);
    }
  } 
  else { this.client.listDatasets(cb); }
};


// ### function getImage (id, callback) 
//
// Gets a specified image of Joyent DataSets using the provided details
// object.
//
// #### @id {Object|String} an object literal with options, or simple the 
// id of the image
// ####     @name    {String}  String name of the package
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// ####     @account {String}  **Optional** The login name of the acct
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
// #### @throws {TypeError} On bad input
//
exports.getImage = function getImage(id, callback) {
  // accept just a string, use it as package name
  if(typeof id === 'string') { id = { name: id }; }
  // if it's a object we need to translate the api apropriately
  if(!(id && id.name)) 
    throw new TypeError('No Image name was provided');

  var self = this,
      cb   = function(err,result) {
        if(err) return callback(err);
        callback(null, new compute.Image(self, result));
      };
  if(id && id.account) {
    this.client.getDataset(id.account, id.name, cb, id.noCache);
  }
  else {
    this.client.getDataset(id.name, cb, id.noCache);
  }
};

// ### function createImage(opts, callback) 
//
// Creates an image in Joyent based on a server
//
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the package
// ####     @server  {Boolean} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
// #### @throws {TypeError} On bad input
//
exports.createImage = function createImage(opts,callback) {
  throw new TypeError('Not implemented');
};