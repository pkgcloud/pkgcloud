/*
 * cdn-containers.js: Instance methods for working with containers from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
var async = require('async'),
  crypto = require('crypto'),
  request = require('request'),
  base = require('../../../openstack'),
  pkgcloud = require('../../../../pkgcloud'),
  _ = require('underscore');

/**
 * client.getContainers
 *
 * @description Get the list of Containers for an account
 * @memberof rackspace/storage
 *
 * @param {object}            [options]
 * @param {Integer}           [options.limit]           The number of records to return
 * @param {String}            [options.marker]          The name of the first record to return in the current query
 * @param {String}            [options.end_marker]      The name of the last record to return in the current query
 * @param {Function}          callback ( error, containers )
 */
exports.getContainers = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getContainerOpts = {
    path: '',
    qs: _.extend({
      format: 'json'
    }, _.pick(options, ['limit', 'marker', 'end_marker']))
  };

  this._request(getContainerOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !(body instanceof Array)) {
      return new Error('Malformed API Response')
    }

    if (!options.loadCDNAttributes) {
      return callback(null, body.map(function (container) {
        return new self.models.Container(self, container);
      }));
    }
    else {
      var containers = [];

      async.forEachLimit(body, 10, function (c, next) {
        var container = new self.models.Container(self, c);

        containers.push(container);
        container.refreshCdnDetails(function (err) {
          if (err) {
            return next(err);
          }
          next();
        })
      }, function (err) {
        callback(err, containers);
      });
    }
  });
};

/**
 * client.getContainer
 *
 * @description Get the details for a specific container
 * @memberof rackspace/storage
 *
 * @param {String|object}       container     The Name or instance of the Container
 * @param {Function}            callback ( error, container )
 */
exports.getContainer = function (container, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container,
    self = this;

  this._request({
    method: 'HEAD',
    container: containerName
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    self._getCdnContainerDetails(containerName, function (err, details) {
      if (err) {
        return callback(err);
      }

      container = _.extend({}, details, {
        name: containerName,
        count: parseInt(res.headers['x-container-object-count'], 10),
        bytes: parseInt(res.headers['x-container-bytes-used'], 10)
      });

      container.metadata = self.deserializeMetadata(self.CONTAINER_META_PREFIX, res.headers);

      callback(null, new self.models.Container(self, container));
    });
  });
};

/**
 * client.getCdnContainers
 *
 * @description Get the list of CDN enabled Containers
 * @memberof rackspace/storage
 *
 * @param {object}              [options]
 * @param {Number}              [options.limit]                 The number of records to return
 * @param {String}              [options.marker]                The name of the first record to return in the current query
 * @param {String}              [options.end_marker]            The name of the last record to return in the current query
 * @param {Boolean}             [options.enabled_only=true]     Only get containers which are CDN enabled
 * @param {Function}            callback ( error, containers )
 */
exports.getCdnContainers = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getContainerOpts = {
    path: '',
    serviceType: this.cdnServiceType,
    qs: _.extend({
      format: 'json'
    }, _.pick(options, ['limit', 'marker', 'end_marker']))
  };

  if (options.cdnOnly) {
    getContainerOpts.qs['enabled_only'] = options.cdnOnly;
  }

  this._request(getContainerOpts, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.map(function (container) {
      //
      // The cdn properties are normally set in response headers
      // when requesting single cdn containers
      //
      container.cdnEnabled = container.cdn_enabled == 'true';
      container.logRetention = container.log_retention == 'true';
      container.cdnUri = container.cdn_uri;
      container.cdnSslUri = container.cdn_ssl_uri;

      return new self.models.Container(self, container);
    }));
  });
};


/**
 * client.getCdnContainer
 *
 * @description Get the details for a specific CDN enabled Container
 * @memberof rackspace/storage
 *
 * @param {String|object}       container     The name or instance of the Container
 * @param {Function}            callback ( error, details )
 */
exports.getCdnContainer = function (container, callback) {
  var self = this;

  this._getCdnContainerDetails(container, function(err, details) {
    return err
      ? callback(err)
      : callback(null, new self.models.Container(self, details));
  });
};

/**
 * client.setCdnEnabled
 *
 * @description Enable or disable cdn capabilities on a storage Container
 * @memberof rackspace/storage
 *
 * @param {String|object}       container               The name or instance of the Container
 * @param {object|boolean}      [options]               Either object with options, or boolean to just enable/disable
 * @param {Boolean}             [options.enabled]       Enable or disable the CDN capability
 * @param {Integer}             [options.ttl]           Configure the CDN TTL for this container
 * @param {Function}            callback ( error, container )
 */
exports.setCdnEnabled = function (container, options, callback) {
  var self = this,
      containerName = container instanceof self.models.Container ? container.name : container,
      enabled = typeof options === 'boolean' ? options : options.enabled;

  if (typeof options === 'function') {
    callback = options;
    options = {};
    enabled = true;
  }

  var cdnOpts = {
    method: 'PUT',
    container: containerName,
    serviceType: this.cdnServiceType,
    headers: {
      'x-cdn-enabled': enabled
    }
  };

  if (options.ttl) {
    cdnOpts.headers['x-ttl'] = options.ttl;
  }

  self._request(cdnOpts, function(err) {
    if (err) {
      return callback(err);
    }

    self.getContainer(containerName, function(err, container) {
      return err
        ? callback(err)
        : callback(err, container);
    });
  });
};

/**
 * client.updateCdnContainer
 *
 * @description Update the settings for a CDN container
 * @memberof rackspace/storage
 *
 * @param {String|object}       container               The name or instance of the Container     
 * @param {object}              options
 * @param {Boolean}             [options.enabled]       Enable or disable the CDN capability
 * @param {Integer}             [options.ttl]           Configure the CDN TTL for this Container
 * @param {Boolean}             [options.logRetention]  Enable log retention for this Container
 * @param {Function}            callback ( error, container )
 */
exports.updateCdnContainer = function (container, options, callback) {
  var self = this,
    containerName = container instanceof self.models.Container ? container.name : container;

  var cdnOpts = {
    method: 'POST',
    container: containerName,
    serviceType: this.cdnServiceType,
    headers: {}
  };

  if (options.ttl) {
    cdnOpts.headers['x-ttl'] = options.ttl;
  }

  if (typeof options.enabled === 'boolean') {
    cdnOpts.headers['x-cdn-enabled'] = options.enabled;
  }

  if (typeof options.logRetention === 'boolean') {
    cdnOpts.headers['x-log-retention'] = options.logRetention;
  }

  self._request(cdnOpts, function (err) {
    if (err) {
      return callback(err);
    }

    self.getContainer(containerName, function (err, container) {
      return err
        ? callback(err)
        : callback(err, container);
    });
  });
};

/**
 * client._getCdnContainerDetails
 *
 * @description Convenience function for getting CDN Container details
 * @memberof rackspace/storage
 *
 * @param {String|object}       container       The name or instance of the Container
 * @param {Function}            callback ( error, container )
 */
exports._getCdnContainerDetails = function(container, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container,
    self = this;

  this._request({
    method: 'HEAD',
    container: containerName,
    serviceType: this.cdnServiceType
  }, function (err, body, res) {
    if (err && !(err.statusCode === 404)) {
      return callback(err);
    }
    else if (err) {
      return callback(null, {}); // return empty object
    }

    container = {
      name: containerName,
      count: parseInt(res.headers['x-container-object-count'], 10),
      bytes: parseInt(res.headers['x-container-bytes-used'], 10)
    };

    container.cdnUri = res.headers['x-cdn-uri'];
    container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
    container.cdnEnabled = res.headers['x-cdn-enabled'] == 'True';
    container.cdnStreamingUri = res.headers['x-cdn-streaming-uri'];
    container.cdniOSUri = res.headers['x-cdn-ios-uri'];
    container.ttl = parseInt(res.headers['x-ttl'], 10);
    container.logRetention = res.headers['x-log-retention'] == 'True';

    container.metadata = self.deserializeMetadata(self.CONTAINER_META_PREFIX, res.headers);

    callback(null, container);
  });
};

/**
 * client.setTemporaryUrlKey
 *
 * @description Set a temporaryUrl key on the current account
 * @memberof rackspace/storage
 *
 * @param {String}      key     the secret key to be used in hmac signing temporary urls
 * @param {Function}    callback ( error )
 */
exports.setTemporaryUrlKey = function(key, callback) {
  this._request({
    method: 'POST',
    headers: {
      'X-Account-Meta-Temp-Url-Key': key
    }
  }, function (err) {
    callback(err)
  });
};

/**
 * client.generateTempUrl
 *
 * @description Create a temporary URL for GET/PUT to a Cloud Files Container
 * @memberof rackspace/storage
 *
 * @param {String|object}       container     The name or instance of the Container
 * @param {String|object}       file          The name or instance of the File
 * @param {String}              method        Either GET or PUT
 * @param {Integers|String}     time          Expiry for the URL in seconds (from now)
 * @param {String}              key           The secret key to be used for signing the URL
 * @param {Function}            callback ( error, tempUrl )
 */
exports.generateTempUrl = function(container, file, method, time, key, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container,
    fileName = file instanceof this.models.File ? file.name : file,
    time = typeof time === 'number' ? time : parseInt(time),
    self = this,
    split = '/v1';

  // We have to be authed to make sure we have the service catalog
  // this is required to validate the service url

  if (!this._isAuthorized()) {
    this.auth(function(err) {
      if (err) {
        callback(err);
        return;
      }

      createUrl();
    });

    return;
  }

  createUrl();

  function createUrl() {
    // construct our hmac signature
    var expiry = parseInt(new Date().getTime() / 1000) + time,
      url = self._getUrl({
        container: containerName,
        path: fileName
      }),
      hmac_body = method.toUpperCase() + '\n' + expiry + '\n' + split + url.split(split)[1];

    var hash = crypto.createHmac('sha1', key).update(hmac_body).digest('hex');

    callback(null, url + "?temp_url_sig=" + hash + "&temp_url_expires=" + expiry);
  }
};
