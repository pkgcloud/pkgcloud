/*
 * computeClient.js: A base ComputeClient for Openstack &
 * Rackspace compute clients
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var urlJoin = require('url-join');

var Client = exports.ComputeClient = function () {
  this.serviceType = 'compute';
}

/**
 * client.getUrl
 *
 * @description get the url for the current compute service
 * 
 * @param options
 * @returns {exports|*}
 */
Client.prototype.getUrl = function (options) {
  options = options || {};

  return urlJoin(this.getServiceUrl(this.serviceType),
    typeof options === 'string'
      ? options
      : options.path);
};

/**
 * client.getVersion
 *
 * @description get the version of the current openstack compute API
 * @param callback
 */
Client.prototype.getVersion = function getVersion(callback) {
  var self = this,
    verbose;

  this.auth(function (err) {
    if (err) {
      return callback(err);
    }

    self.request({
      uri: self.getUrl('/').replace(self.identity.token.tenant.id + '/', '')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }
      verbose = ((typeof body === 'object') ? body.version : JSON.parse(body).version);
      return callback(null, verbose.id, verbose);
    });
  });
};

/**
 * client.getLimits
 *
 * @description Get the API limits for the current account
 * @param callback
 * @returns {*}
 */
Client.prototype.getLimits = function (callback) {
  return this.request({
    path: 'limits'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.limits, res);
  });
};

