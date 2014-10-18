/*
 * images.js: Implementation of AWS Images Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.amazon.compute;

//
// ### function getImages (callback)
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

  var requestOpts = { },
      self = this;

  if (options.owners && options.owners instanceof Array) {
    requestOpts.Owners = options.owners;
  }
  else if (options.owners && typeof options.owners === 'string') {
    requestOpts.Owners = [ options.owners ];
  }

  if (options.images && options.images instanceof Array) {
    requestOpts.ImageIds = options.images;
  }
  else if (options.images && typeof options.images === 'string') {
    requestOpts.ImagesIds = [ options.images ];
  }

  if (!requestOpts.ImageIds && !requestOpts.Owners) {
    requestOpts.Owners = [ 'self' ];
  }

  self.ec2.describeImages(requestOpts, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, data.Images.map(function(image) {
      return new compute.Image(self, image);
    }));
  });
};

// ### function getImage (image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was retrieved.
//
// Gets a specified image of AWS using the provided details
// object.
//
exports.getImage = function getImage(image, callback) {
  var self = this;

  self.getImages({
    images: [ image ]
  }, function(err, images) {
    if (err) {
      callback(err);
      return;
    }

    if (images && images[0]) {
      callback(err, images[0]);
      return;
    }

    callback(new Error('Image not found'))
  });
};

//
// ### function createImage(options, callback)
// #### @id {Object} an object literal with options
// ####     @name    {String}  String name of the image
// ####     @server  {Server} the server to use
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was created.
//
// Creates an image in AWS based on a server
//
exports.createImage = function createImage(options, callback) {
  options || (options = {});

  if (!options.name) throw new TypeError('`name` is a required option');
  if (!options.server) throw new TypeError('`server` is a required option');

  var self    = this,
      serverId = options.server instanceof base.Server
        ? options.server.id : options.server;

  this.ec2.createImage({
    InstanceId: serverId,
    Name: options.name
  }, function(err, data) {
    return err
      ? callback(err)
      : self.getImage(data.ImageId, callback);
  });
};

//
// ### function destroyImage(image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
// Destroys an image in AWS
//
exports.destroyImage = function destroyImage(image, callback) {
  var self = this;

  this.getImage(image, function (err, image) {
    if (err) {
      return callback(err);
    }

    if (!image.blockDeviceMappings || !image.blockDeviceMappings[0] ||
      !image.blockDeviceMappings[0].Ebs || !image.blockDeviceMappings[0].Ebs.SnapshotId) {
      return callback(new TypeError('Image is not EBS backed'));
    }

    self.ec2.deregisterImage({ ImageId: image instanceof base.Image ? image.id : image },
      function(err) {
        if (err) {
          callback(err);
          return;
        }

        self.ec2.deleteSnapshot({
          SnapshotId: image.blockDeviceMappings[0].Ebs.SnapshotId
        }, function(err) {
          return err
            ? callback(err)
            : callback(null, { ok: image.blockDeviceMappings[0].Ebs.SnapshotId });
        });
      });
  });
};
