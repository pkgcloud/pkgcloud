/*
 * client.js: Database client for Openstack Trove Databases
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util      = require('util'),
    urlJoin   = require('url-join'),
    rackspace = require('../../client'),
    auth      = require('../../../common/auth.js'),
    _         = require('lodash');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  this.before.push(auth.accountId);

  _.extend(this, require('./flavors'));
  _.extend(this, require('./instances'));
  _.extend(this, require('./databases'));
  _.extend(this, require('./users'));

  this.serviceType = 'database';
};

util.inherits(Client, rackspace.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  return urlJoin(this._serviceUrl,
    typeof options === 'string'
      ? options
      : options.path);

};

//
// Gets the version of the OpenStack Compute API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion(callback) {
  var self = this;

  this.auth(function (err) {
    if (err) {
      return callback(err);
    }

    self._request({
      uri: self._getUrl('/').replace('/v1.0/' + self._identity.token.tenant.id + '/', '')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }
      return callback(null,
        ((typeof body === 'object') ? body.versions : JSON.parse(body).versions));
    });
  });
};
