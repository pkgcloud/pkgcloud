/*
 * images.js: Implementation of Joyent Images Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    err      = require('../../../core/base/error').Err,
    compute  = pkgcloud.providers.joyent.compute;

// ### function getImages (callback) 
//
// Lists all images available to your account.
//
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
exports.getImages = function getImages(callback) {
  var self = this;
  return this.request(this.config.account + '/datasets', callback, 
    function (body) { callback(null, body.map(function (result) {
      return new compute.Image(self, result);
    }));
  });
};

// ### function getImage (image, callback) 
//
// Gets a specified image of Joyent DataSets using the provided details
// object.
//
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
exports.getImage = function getImage(image, callback) {
  var self       = this,
      imageId    = image instanceof base.Image ? image.id : image;

  // joyent decided to add spaces to their identifiers
  imageId = encodeURIComponent(imageId);

  return this.request(this.config.account + '/datasets/' + imageId, callback, 
    function (body) { callback(null, new compute.Image(self,body));
  });
};

// ### function createImage(options, callback) 
//
// Creates an image in Joyent based on a server
//
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Boolean} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
exports.createImage = function createImage(options, callback) {
  return err('Not supported by joyent', callback);
};

// ### function destroyImage(image, callback) 
//
// Destroys an image in Joyent
//
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
exports.destroyImage = function destroyImage(image, callback) {
  return err('Not supported by joyent', callback);
};