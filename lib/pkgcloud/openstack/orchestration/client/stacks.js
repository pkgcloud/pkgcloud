/*
 * stacks.js: Instance methods for working with stacks from OpenStack Orchestration
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var request = require('request'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  errs = require('errs'),
  urlJoin = require('url-join'),
  util = require('util'),
  _ = require('underscore'),
  orchestration = pkgcloud.providers.openstack.orchestration;

var _urlPrefix = '/stacks';

/**
 * client.getStack
 *
 * @description Gets a stack from the account
 *
 * @param {String|object}   stack    The stack or stackName to fetch
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.getStack = function (stack, callback) {
  var self = this,
    path = stack instanceof orchestration.Stack
      ? urlJoin(_urlPrefix, stack.name, stack.id)
      : urlJoin(_urlPrefix, stack);

  return this._request({
    path: path
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body.stack) {
      return new Error('Unexpected empty response');
    }
    else {
      callback(null, new orchestration.Stack(self, body.stack));
    }
  });
};

/**
 * client.getStacks
 *
 * @description get the list of stacks for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getStacks call
 * @param {function}          callback      f(err, stacks) where stacks is an array of Stack
 * @returns {*}
 */
exports.getStacks = function getStacks(options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var requestOptions = {
    path: _urlPrefix
  };

  requestOptions.qs = _.pick(options,
    'status',
    'name',
    'limit',
    'marker',
    'sort');

  if (options.sortDir) {
    requestOptions.qs['sort_dir'] = options.sortDir;
  }

  if (options.sortKeys) {
    requestOptions.qs['sort_keys'] = options.sortKeys;
  }

  return this._request(requestOptions, function (err, body) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, body.stacks.map(function(stack) {
      return new orchestration.Stack(self, stack);
    }));
  });
};

/**
 * client.createStack
 *
 * @description Creates a stack with the specified options.

 * @param {object}          details         the details to create this stack
 * @param {String}          details.name    the name of the new stack
 * @param {Number}          details.timeout       timeout in minutes for stack creation
 * @param {String}          [details.environment] the environment for the stack
 * @param {Object}          [details.template]    template for the stack, required unless templateUrl is provided
 * @param {String}          [details.templateUrl] url for the template, required if no template
 * @param {Object}          [details.parameters]  optional parameters configuration
 * @param {Object}          [details.files]       optional files configuration
 * @param callback
 * @returns {request|null}
 */
exports.createStack = function (details, callback) {
  if (typeof details === 'function') {
    callback = details;
    details = {};
  }

  details = details || {};

  if (!validateProperties(['name', 'timeout'], details,
    'options.%s is a required argument.', callback)) {
    return;
  }

  if (!details.templateUrl && !details.template) {
    callback(new Error('one of template or templateUrl are required'));
    return;
  }

  var self = this,
    createOptions = {
      method: 'POST',
      path: details.preview ? urlJoin(_urlPrefix, 'preview'): _urlPrefix,
      body: {
        stack_name: details.name,
        // environment is required from the API, but may be empty
        environment: details.environment ? JSON.stringify(details.environment) : JSON.stringify({}),
        timeout_mins: typeof details.timeout === 'number' ? details.timeout : parseInt(details.timeout)
      }
    };

  if (details.template) {
    createOptions.body.template = details.template;
  }
  else if (details.templateUrl) {
    createOptions.body['template_url'] = details.templateUrl;
  }

  if (details.parameters) {
    createOptions.body.parameters = details.parameters;
  }

  if (details.files) {
    createOptions.body.files = details.files;
  }

  // Adopt Stack options
  if (details.stackData) {
    createOptions.body['adopt_stack_data'] = JSON.stringify(details.stackData);

    if (typeof details.disableRollback === 'boolean') {
      createOptions.body['disable_rollback'] = details.disableRollback;
    }

    // if we're adopting a stack, copy the parameters (if any) from the stackData to
    // the request payload
    if (details.stackData.parameters) {
      createOptions.body.parameters = details.stackData.parameters;
    }
  }

  return self._request(createOptions, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body || !body.stack) {
      return new Error('Stack not passed back from OpenStack.');
    }

    // since createStack returns an href to the stack, lets go fetch it
    self.getStack(body.stack.id, callback);
  });
};

/**
 * client.previewStack
 *
 * @description Preview a stack creation with the specified options.

 * @param {object}          details         the details to create this stack
 * @param {String}          details.name    the name of the new stack
 * @param {String}          details.environment   the environment for the stack
 * @param {Number}          details.timeout       timeout in minutes for stack creation
 * @param {Object}          [details.template]    template for the stack, required unless templateUrl is provided
 * @param {String}          [details.templateUrl] url for the template, required if no template
 * @param {Object}          [details.parameters]  optional parameters configuration
 * @param {Object}          [details.files]       optional files configuration
 * @param callback
 * @returns {request|*}
 */
exports.previewStack = function(details, callback) {
  return this.createStack(_.extend(details, { preview: true }), callback);
};

/**
 * client.adoptStack
 *
 * @description adopt a stack from previously abandoned resources

 * @param {object}          details         the details to create this stack
 * @param {String}          details.name    the name of the new stack
 * @param {String}          details.environment   the environment for the stack
 * @param {Number}          details.timeout       timeout in minutes for stack creation
 * @param {Object}          details.stackData     Object with stack data to adopt
 * @param {Boolean}         details.disableRollback     Controls whetehr a failure during stack creation causes deletion
 * @param {Object}          [details.template]    template for the stack, required unless templateUrl is provided
 * @param {String}          [details.templateUrl] url for the template, required if no template
 * @param {Object}          [details.parameters]  optional parameters configuration
 * @param {Object}          [details.files]       optional files configuration
 * @param callback
 * @returns {request|*}
 */
exports.adoptStack = function (details, callback) {
  return this.createStack(details, callback);
};

/**
 * client.updateStack
 *
 * @description Update a stack
 *
 * @param {String|object}   stack    The stack or stackName to update
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.updateStack = function (stack, callback) {
  if (!stack instanceof orchestration.Stack) {
    callback(new Error('you must provide a stack to update'));
    return;
  }

  return this._request({
    path: urlJoin(_urlPrefix, stack.name, stack.id),
    body: {
      template_url: stack.templateUrl,
      template: stack.template,
      files: stack.files,
      environment: stack.environment,
      parameters: stack.parameters,
      timeout_mins: stack.timeout
    },
    method: 'PUT'
  }, function (err) {
    if (err) {
      return callback(err);
    }

    callback(err, stack);
  });
};

/**
 * client.deleteStack
 *
 * @description Delete a stack from the account
 *
 * @param {String|object}   stack    The stack or stackName to delete
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.deleteStack = function (stack, callback) {
  var path = stack instanceof orchestration.Stack
      ? urlJoin(_urlPrefix, stack.name, stack.id)
      : urlJoin(_urlPrefix, stack);

  return this._request({
    path: path,
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }

    callback(err, true);
  });
};

/**
 * client.abandonStack
 *
 * @description Delete a stack, but preserve the created resources
 *
 * @param {String|object}   stack    The stack or stackName to abandon
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.abandonStack = function (stack, callback) {
  var self = this;

  if (typeof stack === 'string') {
    self.getStack(stack, function(err, stack) {
      if (err) {
        callback(err);
        return;
      }

      abandon(stack);
    });

    return;
  }
  else if (!stack instanceof orchestration.stack) {
    callback(new Error('stack must be a string or stack instance'));
    return;
  }

  abandon(stack);

  function abandon(stack) {
    return self._request({
      path: urlJoin(_urlPrefix, stack.name, stack.id, 'abandon'),
      method: 'DELETE'
    }, function (err, abandonStackData) {
      if (err) {
        return callback(err);
      }

      callback(err, abandonStackData);
    });
  }
};

/**
 * validateProperties
 *
 * @description local helper function for validating arguments
 *
 * @param {Array}       required      The list of required properties
 * @param {object}      options       The options object to validate
 * @param {String}      formatString  String formatter for the error message
 * @param {Function}    callback
 * @returns {boolean}
 */
function validateProperties(required, options, formatString, callback) {
  return !required.some(function (item) {
    if (typeof(options[item]) === 'undefined') {
      errs.handle(
        errs.create({ message: util.format(formatString, item) }),
        callback
      );
      return true;
    }
    return false;
  });
}
