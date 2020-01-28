/*
 * (C) Created by Ali Bazlamit on 8/19/2017.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
  base = require('../../../core/compute'),
  oneandone = require('liboneandone-2'),
  compute = pkgcloud.providers.oneandone.compute;
//
// ### function getImages (callback)
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
// Lists all images available to your account.
//
exports.getImages = function getImages(options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var images = [];
  oneandone.listServerAppliances(function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 200) {
      callback(JSON.parse(body));
      return;
    }
    images = JSON.parse(body);
    callback(error, images.map(function (image) {
      return new compute.Image(self, image);
    }));
  });
};

// ### function getImage (image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
// Information about specific appliance
//

exports.getImage = function getImage(image, callback) {
  var self = this;
  var imageId = image instanceof base.Image
    ? image.id
    : image;

  oneandone.getServerAppliance(imageId, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    var img = JSON.parse(body);
    callback(null, new compute.Image(self, img));
  });
};

//
// ### function createImage(options, callback)
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Server} the server to create an image from
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
// Adds a new image from a server
//

exports.createImage = function createImage(options, callback) {
  var self = this;
  options || (options = {});

  var serverId = options.server instanceof base.Server
    ? options.server.id
    : options.server;

  if (!options.name) {
    throw new TypeError('`name` is a required option');
  }

  if (!options.server) {
    throw new TypeError('`server` is a required option');
  }

  var imageData = {
    'server_id': serverId,
    'name': options.name,
    'frequency': oneandone.ImageFrequency.ONCE,
    'source': 'server',
    'num_images': 1,
    'datacenter_id': options.server.datacenter ? options.server.datacenter.id : null
  };

  oneandone.createImage(imageData, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var _image = JSON.parse(body);
    var image = new compute.Image(self, _image);
    callback(null, image);

  });
};

//
// ### function destroyImage(image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
// Destroys an image
//

exports.destroyImage = function destroyImage(image, callback) {
  var imageId = image instanceof base.Image
    ? image.id
    : image;
  oneandone.deleteImage(imageId, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    callback(null, body);
  });
};


