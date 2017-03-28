/*
 * index.js: Rackspace loadbalancer client
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    rackspace = require('../../client'),
    urlJoin = require('url-join'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  _.extend(this, require('./nodes.js'));
  _.extend(this, require('./loadbalancers.js'));

  this.serviceType = 'rax:load-balancer';
};

util.inherits(Client, rackspace.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  var fragment = '';

  if (options.path) {
    fragment = urlJoin(fragment, options.path);
  }

  if (fragment === '' || fragment === '/') {
    return this._serviceUrl;
  }

  return urlJoin(this._serviceUrl, fragment);
};
