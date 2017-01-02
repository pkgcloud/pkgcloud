/*
 * images.js: Implementation of Azure Images Client.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */
var _ = require('lodash');
var async = require('async');
var ComputeManagementClient = require('azure-arm-compute');

var azureApi = require('../../utils/azureApi');
var constants = require('../../utils/constants');

/**
 * Lists all images available to your account.
 * @param {object} options **Optional**
 * @param {string} options.publisher
 * @param {string} options.offer
 * @param {string} options.sku
 * @param {function} callback - cb(err, images). `images` is an array that
 * represents the images that are available to your account
 */
exports.getImages = function getImages(options, callback) {
  var self = this;

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  options = options || {};
  var publisher = options.publisher || constants.DEFAULT_VM_IMAGE.PUBLISHER;
  var offer = options.offer || constants.DEFAULT_VM_IMAGE.OFFER;
  var sku = options.sku || constants.DEFAULT_VM_IMAGE.SKU;

  async.waterfall([
    (next) => {
      azureApi.setup(self, next);
    },
    (next) => {
      var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
      client.virtualMachineImages.list(self.azure.location, publisher, offer, sku, (err, results) => {
        return err
          ? next(err)
          : next(null, results.map(res => new self.models.Image(self, res, publisher, offer, sku)));
      });
    }
  ], callback);
};

/**
 * Gets a specified image of Azure using the provided details object.
 * @param {Image|String} image Image id or an Image
 * @param {string} options.publisher
 * @param {string} options.offer
 * @param {string} options.sku
 * @param {function} callback - cb(err, image). `image` is an object that
 * represents the image that was retrieved.
 */
exports.getImage = function getImage(image , options, callback) {
  var self = this;
  var imageId = image instanceof self.models.Image ? image.id : image;
  var version = image instanceof self.models.Image ? image.name : image;

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  options = options || {};
  var publisher = options.publisher || constants.DEFAULT_VM_IMAGE.PUBLISHER;
  var offer = options.offer || constants.DEFAULT_VM_IMAGE.OFFER;
  var sku = options.sku || constants.DEFAULT_VM_IMAGE.SKU;

  async.waterfall([
    (next) => {
      azureApi.setup(self, next);
    },
    (next) => {
      var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
      client.virtualMachineImages.get(self.azure.location, publisher, offer, sku, version, (err, result) => {
        return err
          ? next(err)
          : next(null, new self.models.Image(self, result, publisher, offer, sku, version));
      });
    }
  ], callback);
};

/**
 * ### function createImage(options, callback)
 * #### @id {Object} an object literal with options
 * ####     @name    {String}  String name of the image
 * ####     @server  {Server} the server to use
 * #### @callback {function} f(err, image). `image` is an object that
 * represents the image that was created.
 *
 * Creates an image in Azure based on a server
 */
exports.createImage = function createImage(options, callback) {
  options || (options = {});

  if (!options.name) {
    throw new TypeError('`name` is a required option');
  }

  if (!options.server) {
    throw new TypeError('`server` is a required option');
  }

  var self    = this,
    serverId  = options.server instanceof self.models.Server
      ? options.server.id
      : options.server;

  azureApi.createImage(this, serverId, options.name, function (err, result) {
    return !err
      ? self.getImage(result, callback)
      : callback(err);
  });
};

/**
 * ### function destroyImage(image, callback)
 * #### @image    {Image|String} Image id or an Image
 * #### @callback {function} f(err, image). `image` is an object that
 * represents the image that was deleted.
 *
 * Destroys an image in Azure
 */
exports.destroyImage = function destroyImage(image, callback) {
  var self = this,
      imageId = image instanceof self.models.Image ? image.id : image,
      path = self.config.subscriptionId + '/services/images/' + imageId;

  self._xmlRequest({
    method: 'DELETE',
    path: path
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, { ok: imageId }, res);
  });
};
