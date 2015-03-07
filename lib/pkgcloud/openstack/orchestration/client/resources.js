/*
 * resources.js: Instance methods for working with stack resources from OpenStack Orchestration
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
  urlJoin = require('url-join'),
  _ = require('underscore'),
  orchestration = pkgcloud.providers.openstack.orchestration;

var _urlPrefix = '/resource_types';

/**
 * client.getResource
 *
 * @description get the resource data for a provided resource and stack
 *
 * @param {object|string}     stack         stack or stackName to find resources for
 * @param {object|string}     resource      resource or resourceName to get
 * @param {function}          callback      f(err, resource)
 * @returns {*}
 */
exports.getResource = function (stack, resource, callback) {
  var self = this;

  function getResource(stack) {
    return self._request({
      path: urlJoin('/stacks', stack.name, stack.id, 'resources',
          resource instanceof orchestration.Resource ? resource.name : resource)
    }, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, new orchestration.Resource(self, _.extend({ stack: stack }, body.resource)));
    });
  }

  if (stack instanceof orchestration.Stack) {
    getResource(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function (err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getResource(stack);
    });
  }
};

/**
 * client.getResources
 *
 * @description get the list of stack resources for a provided stack
 *
 * @param {object|string}     stack         stack or stackName to find resources for
 * @param {function}          callback      f(err, resources) where stacks is an array of Resource
 * @returns {*}
 */
exports.getResources = function (stack, options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  function getResources(stack) {
    var requestOptions = {
      path: urlJoin('/stacks', stack.name, stack.id, 'resources'),
      qs: []
    };

    if (options.nestedDepth) {
      requestOptions.qs['nested_depth'] = options.nestedDepth;
    }

    return self._request(requestOptions, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body.resources.map(function(resource) {
        return new orchestration.Resource(self, _.extend({ stack: stack }, resource));
      }));
    });
  }

  if (stack instanceof orchestration.Stack) {
    getResources(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function (err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getResources(stack);
    });
  }

};

/**
 * client.getResourceTypes
 *
 * @description get the list of resource types for the account
 *
 * @param {function}          callback      f(err, resourceTypes) where resourceTypes is an array of types
 * @returns {*}
 */
exports.getResourceTypes = function (callback) {
  var self = this;

  return self._request({
    path: _urlPrefix
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    callback(null, body.resource_types);
  });
};

/**
 * client.getResourceSchema
 *
 * @description get the schema for a provided resource type
 *
 * @param {string}            resourceType  the resourceType to get the schema for
 * @param {function}          callback      f(err, schema)
 * @returns {*}
 */
exports.getResourceSchema = function (resourceType, callback) {
  var self = this;

  return self._request({
    path: urlJoin(_urlPrefix, resourceType)
  }, function (err, schema) {
    if (err) {
      return callback(err);
    }

    callback(null, schema);
  });
};

/**
 * client.getResourceTemplate
 *
 * @description get the template for a provided resource type
 *
 * @param {string}            resourceType  the resourceType to get the template for
 * @param {function}          callback      f(err, template)
 * @returns {*}
 */
exports.getResourceTemplate = function (resourceType, callback) {
  var self = this;

  return self._request({
    path: urlJoin(_urlPrefix, resourceType, 'template')
  }, function (err, template) {
    if (err) {
      return callback(err);
    }

    callback(null, template);
  });
};
