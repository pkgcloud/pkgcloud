/*
 * images.js: Implementation of Azure Images Client.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
  base     = require('../../../core/compute'),
  errs     = require('errs'),
  azure     = require('azure'),
  azureServer = require('./azure/azureServer.js'),
  compute  = pkgcloud.providers.azure.compute;

//
// ### function getImages (callback)
// #### @callback {function} f(err, images). `images` is an array that
// represents the images that are available to your account
//
// Lists all images available to your account.
//

var getAzureServerInfo = function(server) {
  var serverInfo;

  if(server instanceof base.Server) {
    serverInfo = new azureServer.AzureServerInfo(server.serviceName, server.name, server.azure);
  } else {
    // we have just a server name
    serverInfo = new azureServer.AzureServerInfo(server, server, null);
  }

  return serverInfo;
};

exports.getImages = function getImages(options, callback) {

  var sm = this._getManagementService(),
    self = this;

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  sm.listOSImage(function(err, res) {
    if(err) {
      callback(err)
    } else {
      var images = [];
      res.body.map(function (image) {
        images.push(new compute.Image(self, image));
      });
      callback(null,images);
    }
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

  var sm = this._getManagementService(),
    self = this,
    imageId = image instanceof base.Image ? image.id : image;

  sm.getOSImage(imageId, function(err, res) {
    if(err) {
      callback(err)
    } else {
      callback(null,new compute.Image(self, res.body),res);
    }
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
// Creates an image in Azure based on a server
// Note: server will be stopped if is running
// Note: server will be DELETED after image is created!!! Azure seems to require this.
//
//
exports.createImage = function createImage(options, callback) {
  options || (options = {});

  var az = new azureServer.AzureServer(this.config),
    serverInfo,
    self = this;

  if (!options.name) throw new TypeError('`name` is a required option');
  if (!options.server) throw new TypeError('`server` is a required option');

  serverInfo = getAzureServerInfo(options.server);
  az.createImage(serverInfo, options.name, function(err) {
    if(err) {
      callback(err);
    } else {
      self.getImage(options.name, callback);
    }
  });
};

//
// ### function destroyImage(image, callback)
// #### @image    {Image|String} Image id or an Image
// #### @callback {function} f(err, image). `image` is an object that
// represents the image that was deleted.
//
// Destroys an image in Azure
//
exports.destroyImage = function destroyImage(image, callback) {

  var sm = this._getManagementService(),
    self = this,
    imageId = image instanceof base.Image ? image.id : image;

  sm.deleteOSImage(imageId, function(err, res) {
    if(err) {
      callback(err)
    } else {
      callback(null, { ok: imageId}, res);
    }
  });
};
