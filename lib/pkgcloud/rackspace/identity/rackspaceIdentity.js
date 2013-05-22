/*
 * rackspaceIdentity.js: rackspaceIdentity model
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var _ = require('underscore'),
  identity = require('../../openstack/identity'),
  Identity = identity.Identity,
  util = require('util');

var RackspaceIdentity = function (options) {
  this.options = options;
  this.name = 'RackspaceIdentity';
};

util.inherits(RackspaceIdentity, Identity);

RackspaceIdentity.prototype._buildAuthenticationPayload = function () {
  var self = this;

  RackspaceIdentity.super_.prototype._buildAuthenticationPayload.call(this);

  if (!self._authenticationPayload) {
    // setup our inputs for authorization
    // key & username
    if (self.options.apiKey && self.options.username) {
      self._authenticationPayload = {
        auth: {
          'RAX-KSKEY:apiKeyCredentials': {
            username: self.options.username,
            apiKey: self.options.apiKey
          }
        }
      };
    }
  }
};

exports.createIdentity = function (options, callback) {
  if (!options.url) {
    options.url = 'https://identity.api.rackspacecloud.com';
  }

  var id = new RackspaceIdentity(options);

  identity.createIdentity(_.extend(options, { identity: id }), callback);
};