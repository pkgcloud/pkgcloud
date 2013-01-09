/*
 * images.js: Implementation of OpenStack Images Client.
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.openstack.compute;

//
// ### function getImages (callback) 
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
// Lists all images available to your account.
//
exports.getImages = function getImages(callback) {
  var self = this;

  return this.request('images/detail', callback, function (body, res) {
    callback(null, body.images.map(function (result) {
      return new compute.Image(self, result);
    }), res);
  });
};

//
// ### function getImage (image, callback) 
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
// Gets a specified image of OpenStack Images using the provided details
// object.
//
exports.getImage = function getImage(image, callback) {
  var self    = this,
      imageId = image instanceof base.Image ? image.id : image;
  return this.request('images/' + imageId, callback, function (body, res) {
    callback(null, new compute.Image(self, body.image), res);
  });
};

//
// ### function createImage(options, callback) 
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Server|String} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
// Creates an image in OpenStack based on a server
//
exports.createImage = function createImage(options, callback) {
  var self     = this,
      serverId = options.server instanceof compute.Server 
        ? options.server.id 
        : parseInt(options.server, 10);
        
  return this.request({ method: 'POST', path: 'images',
    body: {
      image: {
        name: options.name,
        serverId: serverId
      }
    }
  }, callback, function (body, res) {
    callback(null, new compute.Image(self, body.image), res);
  });
};

//
// ### function destroyImage(image, callback) 
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, {ok: imageId}). `image` is an object that
// represents the image that was deleted.
//
// Destroys an image in OpenStack
//
exports.destroyImage = function destroyImage(image, callback) {
  var self    = this,
      imageId = image instanceof compute.Image ? image.id : image;
  return this.request({ method: 'DELETE', path: 'images/' + imageId },
    callback, function (_, res) { callback(null, { ok: imageId }, res);
  });
};