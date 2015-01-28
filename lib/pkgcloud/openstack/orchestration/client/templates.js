/*
 * templates.js: Instance methods for working with templates from OpenStack Orchestration
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
  urlJoin = require('url-join'),
  orchestration = pkgcloud.providers.openstack.orchestration;

var _urlPrefix = '/stacks';

/**
 * client.getTemplate
 *
 * @description get the template for a provided stack
 *
 * @param {object|string}     stack         the stackName or stack for the template query
 * @param {function}          callback      f(err, template)
 * @returns {*}
 */
exports.getTemplate = function (stack, callback) {
  var self = this;

  function getTemplate(stack) {
    return self._request({
      path: urlJoin(_urlPrefix, stack.name, stack.id, 'template')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }
      if (!body) {
        return new Error('Unexpected empty response');
      }
      else {
        callback(null, body);
      }
    });
  }

  if (stack instanceof orchestration.Stack) {
    getTemplate(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function(err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getTemplate(stack);
    });
  }

};

/**
 * client.validateTemplate
 *
 * @description validate a provided template
 *
 * @param {object|string}     template      the template or templateUrl to validate
 * @param {function}          callback      f(err, template)
 * @returns {*}
 */
exports.validateTemplate = function (template, callback) {
  var self = this,
    requestOpts = {
      path: urlJoin('/validate'),
      method: 'POST',
      body: {}
    };

  if (typeof template === 'string') {
    requestOpts.body.template_url = template;
  }
  else if (typeof template === 'object') {
    requestOpts.body.template = template;
  }
  else {
    callback(new Error('please provide either a template object, or a templateUrl'));
  }

  return self._request(requestOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body) {
      return new Error('Unexpected empty response');
    }
    else {
      callback(null, body);
    }
  });
};
