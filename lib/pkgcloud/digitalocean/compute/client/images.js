/*
 * images.js: Implementation of DigitalOcean Images Client.
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    errs     = require('errs'),
    urlJoin = require('url-join'),
    compute  = pkgcloud.providers.digitalocean.compute;

//
// ### function getImages (callback)
// #### @options {Object} Options when getting images
// ####   @options.per_page {number} **Optional** Number of images to list
// ####   @options.page  {number} **Optional** Page number of images to return
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
// Lists all images available to your account.
//
exports.getImages = function getImages(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this,
      per_page = options.per_page || 200,
      page = options.page || 1;

  return this._request({
    path: '/v2/images',
    qs: {
      per_page: per_page,
      page: page
    }
  }, function (err, body, res) {
    if (err || !body.images) {
      return callback(err || new Error('No images found.'));
    }

    callback(null, body.images.map(function (result) {
      return new compute.Image(self, result);
    }), res);
  });
};

// ### function getImage (image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
// Gets a specified image of DigitalOcean DataSets using the provided details
// object.
//
exports.getImage = function getImage(image, callback) {
  var imageId = image instanceof base.Image ? image.id : image,
      self    = this;

  return this._request({
    path: urlJoin('/v2/images/', imageId)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new compute.Image(self, body), res);
  });
};

//
// ### function createImage(options, callback)
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Boolean} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
// Creates an image in DigitalOcean based on a server
//
exports.createImage = function createImage(options, callback) {
  return errs.handle(
    errs.create({ message: 'Not supported by DigitalOcean' }),
    callback
  );
};

//
// ### function destroyImage(image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
// Destroys an image in DigitalOcean
//
exports.destroyImage = function destroyImage(image, callback) {
  var imageId = image instanceof base.Image ? image.id : image;

  return this._request({
    path: urlJoin('/images/', imageId , '/destroy'),
    method: 'DELETE'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, { ok: imageId }, res);
  });
};
