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

Client.prototype.getUrl = function (options) {
  options = options || {};

  return urlJoin(this.getServiceUrl(this.serviceType),
    typeof options === 'string'
      ? options
      : options.path);
};

//
// Gets the version of the OpenStack Compute API we are running against
// Parameters: callback
//
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
