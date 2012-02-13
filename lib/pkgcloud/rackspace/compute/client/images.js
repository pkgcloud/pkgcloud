/*
 * images.js: Implementation of Rackspace Images Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.rackspace.compute;

// ### function getImages (callback) 
//
// Lists all images available to your account.
//
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
exports.getImages = function getImages(callback) {
  var self = this;
  return this.request('images/detail.json', callback, function (body) {
    callback(null, body.images.map(function (result) {
      return new compute.Image(self, result);
    }));
  });
};

// ### function getImage (image, callback) 
//
// Gets a specified image of Rackspace Images using the provided details
// object.
//
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
exports.getImage = function getImage(image, callback) {
  var self       = this,
      imageId    = image instanceof base.Image ? image.id : image;

  return this.request('images/' + imageId, callback, function (body) {
    callback(null, new compute.Image(self, body.image));
  });
};

// ### function createImage(options, callback) 
//
// Creates an image in Rackspace based on a server
//
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Server|String} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
exports.createImage = function createImage(options, callback) {
  var self     = this,
      serverId = options.server instanceof compute.Server 
               ? options.server.id : parseInt(options.server, 10);

  return this.request({ method: 'POST', path: 'images',
    body: {
      image: {
        name: options.name,
        serverId: serverId
      }
    }
  }, callback, function (body) {
    callback(null, new compute.Image(self, body.image));
  });
};

// ### function destroyImage(image, callback) 
//
// Destroys an image in Rackspace
//
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, {ok: imageId}). `image` is an object that
// represents the image that was deleted.
//
exports.destroyImage = function destroyImage(image, callback) {
  var self    = this,
      imageId = image instanceof compute.Image ? image.id : image;

  return this.request({ method: 'DELETE', path: 'images/' + imageId },
    callback, function () { callback(null, {"ok": imageId});
  });
};