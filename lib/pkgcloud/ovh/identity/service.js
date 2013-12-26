/*
 * service.js: Service model
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var _ = require('underscore');

/**
 * Service class
 *
 * @description The service class is a thin wrapper on an entry in the openstack
 * service catalog
 *
 * @param {String}  region      the default region to use for this service
 * @param {object}  details     the data for the new service
 * @param {object}  details.endpoints       the array of endpoints
 * @param {String}  details.name            the name of the service
 * @param {String}  details.type            the type of the new service
 * @constructor
 */
var Service = function (region, details) {
  var self = this;

  region = region || '';

  if (!details) {
    throw new Error('details are a required argument');
  }

  self.endpoints = details.endpoints;
  self.name = details.name;
  self.type = details.type;
  self.useInternal = typeof details.useInternal === 'boolean' ? details.useInternal : false;

  self.selectedEndpoint = exports.validateRegionForService(self, region);

  if (!self.selectedEndpoint) {
    throw new Error('Unable to find endpoint for specified region');
  }
};

/**
 * Service.getEndpointUrl
 *
 * @description gets the endpoint URL for a given service, optionally providing
 * the region.
 *
 * @param {object} options              the options for the endpoint call
 * @param {String} [options.region]     a region to use, if provided
 * @param {boolean} [options.internal]  prefer an internal endpoint, if available
 *
 * @returns {String}            the endpoint uri
 */
Service.prototype.getEndpointUrl = function (options) {
  var self = this,
    url = null;

  options = options || {};

  if (options.region) {
    _.each(self.endpoints, function (endpoint) {
      if (!endpoint.region || !matchRegion(endpoint.region, options.region)) {
        return;
      }

      url = getUrl(endpoint);
    });
  }
  else {
    url = getUrl(self.selectedEndpoint);
  }

  /**
   * getUrl
   *
   * @description utility function for getEndpointUrl
   * @param {object} endpoint     the endpoint to use
   * @param {string} [endpoint.internalURL]     the internal URL of the endpoint
   * @param {string} [endpoint.publicURL]       the public URL of the endpoint
   *
   * @returns {String} the uri of the endpoint
   */
  function getUrl(endpoint) {

    var useInternal = typeof options.useInternal === 'boolean' ?
      options.useInternal : self.useInternal;

    return useInternal && endpoint.internalURL
      ? endpoint.internalURL
      : (options.admin && endpoint.adminURL ?
        endpoint.adminURL : endpoint.publicURL);
  }

  if (!url) {
    throw new Error('Unable to identity endpoint url');
  }

  return url;
};

exports.Service = Service;

/**
 * service.validateRegionForService
 *
 * @description validates that a provided region has an endpoint within a defined
 * service.
 * @param {object}      service     raw service data to validate
 * @param {String}      region      the region to check for
 * @param {Function}    [callback]  optional callback for async validation
 *
 * @returns {object}    The valid endpoint, if found
 */
exports.validateRegionForService = function (service, region, callback) {
  if (!service) {
    var error = new Error('service is a required argument');
    if (callback) {
      return callback(error);
    }

    throw error;
  }

  var validEndpoint;

  // first look for the endpoint that matches the region provided
  _.each(service.endpoints, function (endpoint) {
    if (matchRegion(endpoint.region, region)) {
      validEndpoint = endpoint;
    }
  });

  // if we didn't find the specific region, see if there's a regionless endpoint
  if (!validEndpoint) {
    _.each(service.endpoints, function (endpoint) {
      if (!validEndpoint && !endpoint.region) {
        validEndpoint = endpoint;
      }
    });
  }

  // if we didn't find a match, but there's only 1 endpoint with no region attribute
  // go ahead and use that one
  if (!validEndpoint && service.endpoints.length === 1) {
    validEndpoint = service.endpoints[0];
  }

  // if we didn't find an endpoint, error out
  if (!validEndpoint && region) {
    callback && callback(new Error('Unable to identify target endpoint for Service: ' + service.name));
  }
  else if (!validEndpoint) {
    callback && callback(new Error('Unable to identify regionless endpoint for Service: ' + service.name));
  }
  else {
    callback && callback(null, validEndpoint);
  }

  return validEndpoint;
};

function matchRegion(a, b) {
  if (!a && !b) {
    return true;
  }
  else if ((!a && b) || (a && !b)) {
    return false;
  }

  return a.toLowerCase() === b.toLowerCase();
}
