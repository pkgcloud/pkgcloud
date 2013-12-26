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
// ### @private {RegExp} imageId
// Regular expression to strip image guid from
// an OpenStack URL.
//
var imageId = new RegExp("images/([abcdef0-9]{8}-[abcdef0-9]{4}-[abcedf0-9]{4}-[abcdef0-9]{4}-[abcdef0-9]{12})$");

//
// ### function getImages (callback)
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
// Lists all images available to your account.
//
exports.getImages = function getImages(callback) {
  var self = this;

  return this.request({
    path: 'images/detail'
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    if (!body || ! body.images) {
      return callback(new Error('Unexpected empty response'));
    }
    else {
      return callback(null, body.images.map(function (result) {
        return new compute.Image(self, result);
      }), res);
    }
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
  return this.request({
    path: 'images/' + imageId
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    if (!body || !body.image) {
      return callback(new Error('Unexpected empty response'));
    }
    else {
      return callback(null, new compute.Image(self, body.image), res);
    }
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
// TODO this should be entirely refactored to move this into
// the global doServerAction function on the client
exports.createImage = function createImage(options, callback) {
  var self = this,
      serverId;

  serverId = options.server instanceof compute.Server
    ? options.server.id
    : options.server;

  return this.request({
    method: 'POST',
    path: 'servers/' + serverId + '/action',
    body: {
      createImage: { name: options.name }
    }
  },
  function (err, body, res) {
    if (err) {
      return callback(err);
    }
    //
    // Openstack returns a URL to a non-existant End point, so instead
    // we strip the guid off the end of the request and return it as the
    // image Id
    //
    // TODO (indexzero): Optimize this
    //
    var match = res.headers['location'].match(imageId);
    return !match
      ? callback(new Error('Invalid image returned from OpenStack'), res)
      : self.getImage(match[1], callback);
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
    function (err, res) {
      return err
        ? callback(err)
        : callback(null, { ok: imageId }, res);
  });
};