/*
 * instances.js: Instance methods for working with database instances from Rackspace Cloud
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

/**
 * @module databases
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    Flavor   = pkgcloud.providers.rackspace.database.Flavor,
    Instance = pkgcloud.providers.rackspace.database.Instance,
    errs     = require('errs'),
    qs       = require('querystring');

/**
 * client.createInstance
 * @description Create a database Instance of a given Flavor
 *
 * @param {object}              object
 * @param {String}              object.name     Name of instance
 * @param {String|object}       object.flavor   Either HREF of flavor or instance of Flavor
 * @param {Integer}             [object.size=1] Storage size in GB (1-8)
 * @param {String[]}            [object.databases] Array of database names to create
 * @param {Function}            callback ( error, Instance )
 */
exports.createInstance = function createInstance(options, callback) {
  var self = this,
      flavorRef,
      size;

  // Check for options
  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create an instance.'
    }), options);
  }

  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. name is a required argument'
    }), callback);
  }

  if (!options['flavor']) {
    return errs.handle(errs.create({
      message: 'options. flavor is a required argument'
    }), callback);
  }

  // If the 'databases' are specified we create a template for each database name.
  if (options && options['databases'] &&
      typeof options['databases'] === 'array' &&
      options['databases'].length > 0) {
    options['databases'].forEach(function (item, idx) {
      if (typeof item === 'string') {
        // This template is according to the defaults of rackspace.
        options['databases'][idx] = {
          name: item,
          character_set: "utf8",
          collate: 'utf8_general_ci'
        };
      }
    });
  }

  // Check for the correct value of 'size', should be between 1 and 8 otherwise will be 1
  if (options && options['size']) {
    // Ensure size is an Integer
    if (typeof options['size'] !== 'number') {
      return errs.handle(errs.create({
        message: 'options. Volume size should be a Number, not a String'
      }), callback);
    }
    size = (options['size'] > 0 && options['size'] < 9) ? options['size'] : 1;
  }

  // Extract the href value of the Flavor instance
  // Should be always true because above we return an error if not exists
  if (options && options['flavor']) {
    flavorRef = options['flavor'] instanceof Flavor ? options['flavor'].href : options['flavor'];
  }

  var createOptions = {
    method: 'POST',
    path: 'instances',
    body: {
      instance: {
        name: options['name'],
        flavorRef: flavorRef,
        databases: options['databases'] || [],
        volume: { size: size || 1 }
      }
    }
  };

  this._request(createOptions, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, new Instance(self, body.instance));
  });
};

/**
 * client.getInstances
 * @description Get information for all/some Instances
 *
 * @params {object}             object
 * @params {Integer}            [options.limit] Number of results to return
 * @params {Integer}            [options.offset} Offset for result set
 * @params {Function}           callback ( error, instance, offset )
 */
exports.getInstances = function getInstances(options, callback) {
  var self = this,
      completeUrl = {},
      requestOptions = {};

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // The limit parameter for truncate results
  if (options && options.limit) {
    completeUrl.limit = options.limit;
  }

  // The offset
  if (options && options.offset) {
    completeUrl.marker = options.offset;
  }

  requestOptions.qs = completeUrl;
  requestOptions.path = 'instances';

  this._request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    var marker = null;
    if (body.links && body.links.length > 0) {
      marker = qs.parse(body.links[0].href.split('?').pop()).marker;
    }

    callback(null, body.instances.map(function (result) {
      return new Instance(self, result);
    }), marker);
  });
};


/**
 * client.destroyInstance
 * @description Destroy a database Instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error, response )
 */
exports.destroyInstance = function destroyInstance(instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;
  this._request({
    method: 'DELETE',
    path: 'instances/' + instanceId
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, response);
  });
};


/**
 * client.getInstance
 * @description Get information for a specific Instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error, instance)
 */
exports.getInstance = function getInstance(instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var self = this;
  var instanceId = instance instanceof Instance ? instance.id : instance;
  this._request({
    path: 'instances/' + instanceId
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, new Instance(self, body.instance));
  });
};


/**
 * client.restartInstance
 * @description Restart a specific instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error )
 */
exports.restartInstance = function restartInstance(instance, callback) {
  // Check for instance
  if (typeof instance === 'function' || typeof instance === 'undefined') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;

  var restartOptions = {
    method: 'POST',
    path: 'instances/' + instanceId + '/action',
    body: { restart: {} }
  };

  this._request(restartOptions, function (err, body, response) {
    if (err) {
      return callback(err);
    }

    if (response.statusCode === 202) {
      return callback(null);
    }

    errs.handle(errs.create({
      message: 'Bad response from restart action.'
    }), callback);
  });
};


/**
 * client.setFlavor
 * @description Resize the memory of a database Instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {object}              flavor          New Flavor for Instance
 * @param {Function}            callback ( error )
 */
exports.setFlavor = function setFlavor(instance, flavor, callback) {
  // Check for the flavor
  if (typeof flavor === 'function' || typeof flavor === 'undefined') {
    return errs.handle(errs.create({
      message: 'A flavor is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  // Check for instance
  if (typeof instance === 'function' || typeof instance === 'undefined') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }

  if (!(flavor instanceof Flavor)) {
    return errs.handle(errs.create({
      message: 'A valid flavor is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  //@todo: Check if the new flavor are different from the old.

  var instanceId = instance instanceof Instance ? instance.id : instance;

  var resizeOptions = {
    method: 'POST',
    path: 'instances/' + instanceId + '/action',
    body: {
      resize: {
        flavorRef: flavor.href
      }
    }
  };

  this._request(resizeOptions, function (err, body, response) {
    if (err) {
      return callback(err);
    }

    if (response.statusCode === 202) {
      return callback(null);
    }
    return errs.handle(errs.create({
      message: 'Bad response from resize action.'
    }), callback);
  });
};


/**
 * client.setVolumeSize
 * @description Resize the storage size of the database instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Number}              newSize         New size for the volume (1-8)
 * @param {Function}            callback ( error )
 */
exports.setVolumeSize = function setVolumeSize(instance, newSize, callback) {
  // Check for instance
  if (typeof instance === 'function' || typeof instance === 'undefined') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  // Check for the volume size
  if (typeof newSize === 'function' || typeof newSize === 'undefined') {
    return errs.handle(errs.create({
      message: 'An correct volume size is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  if (newSize > 10 || newSize < 1) {
    return errs.handle(errs.create({
      message: 'An correct volume size is required.'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;

  var resizeOptions = {
    method: 'POST',
    path: 'instances/' + instanceId + '/action',
    body: {
      resize: {
        volume: { size: newSize }
      }
    }
  };

  this._request(resizeOptions, function (err, body, response) {
    if (err) {
      return callback(err);
    }

    if (response.statusCode === 202) {
      return callback(null);
    }
    return errs.handle(errs.create({
      message: 'Bad response from resize action.'
    }), callback);
  });
};
