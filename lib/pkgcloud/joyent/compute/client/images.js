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
    compute  = pkgcloud.providers.joyent.compute;

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
//
exports.getImages = function (opts,callback) {
  var self = this;

  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }

  if(typeof opts === 'string') { opts = { account: opts }; }

  this.request(this.config.account + '/datasets', callback, 
    function (body) {
      try {
        callback(null, JSON.parse(body).map(function (result) {
          return new compute.Image(self, result);
        }));
      } catch (e) { callback(e); }
    });
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
//
exports.getImage = function getImage(id, callback) {
  var self = this;

  // accept just a string, use it as package name
  if(typeof id === 'string') { id = { name: id }; }
  // if it's a object we need to translate the api apropriately
  if(!(id && id.name)) 
    throw new TypeError('No Image name was provided');

  // joyent decided to add spaces to their identifiers
  id.name = encodeURIComponent(id.name);
  
  this.request(this.config.account + '/datasets/' + id.name , callback,
    function (body) {
      try {
        callback(null, new compute.Image(self,JSON.parse(body)));
      } catch (e) { callback(e); }
  });
};

// ### function createImage(opts, callback) 
//
// Creates an image in Joyent based on a server
//
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Boolean} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
exports.createImage = function createImage(opts,callback) {
  callback(new Error('Not supported by joyent'));
};

// ### function destroyImage(opts, callback) 
//
// Destroys an image in Joyent
//
// #### @image {String} Name of the image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
exports.destroyImage = function (image, callback) {
  callback(new Error('Not supported by joyent'));
};