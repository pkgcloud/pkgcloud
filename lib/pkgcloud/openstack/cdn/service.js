/*
 * service.js: OpenStack CDN Service
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 *
 */

var util  = require('util'),
    base  = require('../../core/base'),
    _     = require('lodash');

var Service = exports.Service = function Service(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Service, base.Model);

Service.prototype._setProperties = function (details) {
  this.id = details.id || details['id'];
  this.name = details.name || details['name'];
  this.domains = details.domains || details['domains'];
  this.origins = details.origins || details['origins'];
  this.caching = details.caching || details['caching'];
  this.restrictions = details.restrictions || details['restrictions'];
  this.flavorId = details.flavorId || details['flavor_id'];
  this.status = details.status || details['status'];
  this.links = details.links;
  this.errors = details.errors;
};

Service.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'domains', 'origins', 'caching', 
    'restrictions', 'flavorId', 'status', 'links', 'errors']);
};
