/*
 * serviceCatalog.js: ServiceCatalog model
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var service = require('./service'),
    Service = require('./service').Service,
    async = require('async'),
    _ = require('underscore');

/**
 * ServiceCatalog class
 *
 * @description wrapper for the service catalog response from keystone
 *
 * @param {String}  region      the default region to use for the service catalog
 * @param {object}  catalog     the raw data to parse into the catalog
 * @constructor
 */
var ServiceCatalog = function (region, catalog, useInternal) {
  var self = this;

  self.region = region;
  self.services = {};
  self.useInternal = typeof useInternal === 'boolean' ? useInternal : false;

  _.each(catalog, function (service) {
    // Special hack for rackspace with two compute types
    if (service.type === 'compute' && service.name === 'cloudServers') {
      return;
    }

    self.services[service.name] = new Service(self.region,
      _.extend(service, { useInternal: self.useInternal }));
  });
};

ServiceCatalog.prototype.getServiceByName = function (name) {
  return this.services[name];
};

ServiceCatalog.prototype.getServiceByType = function (type) {
  var svc;

  _.each(this.services, function (service) {
    if (service.type.toLowerCase() === type.toLowerCase()) {
      svc = service;
    }
  });

  return svc;
};

exports.ServiceCatalog = ServiceCatalog;

/**
 * serviceCatalog.validateServiceCatalog
 *
 * @description Allow for asynchronous validation of the service catalog before
 * initializing via constructor. Allows for callbacks to return with err in lieu
 * of throwing Error() when provided with invalid inputs
 *
 * @param {String}      region      the default region for the catalog
 * @param {object}      catalog     the service catalog to parse
 * @param {Function}    callback
 */
exports.validateServiceCatalog = function (region, catalog, callback) {
  async.forEachSeries(catalog, function (svc, next) {
    service.validateRegionForService(svc, region, next);
  }, callback);
};