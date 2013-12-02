/*
 * index.js: Rackspace loadbalancer client
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    rackspace = require('../../client'),
    urlJoin = require('url-join'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./nodes.js'));
  utile.mixin(this, require('./loadbalancers.js'));

  this.serviceType = 'rax:load-balancer';
};

utile.inherits(Client, rackspace.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  var fragment = '',
    service = options.serviceType || this.serviceType;

  if (options.path) {
    fragment = urlJoin(fragment, options.path);
  }

  if (fragment === '' || fragment === '/') {
    return this.getServiceUrl(service);
  }

  return urlJoin(this.getServiceUrl(service), fragment);
};
