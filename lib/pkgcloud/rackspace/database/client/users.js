/*
 * users.js: Client methods for working with users on database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    Database = pkgcloud.providers.rackspace.database.Database,
    Instance = pkgcloud.providers.rackspace.database.Instance,
    User     = pkgcloud.providers.rackspace.database.User,
    errs     = require('errs'),
    qs       = require('querystring');

// Create a User for a Database.
// Need an Instance and a Database name.
// ### @options {Object} Set of options can be
// #### options['username'] {string} Name of user to create (required)
// #### options['password'] {string} The password for the user to create (required)
// #### options['databases'] {string | array} Name or instances of databases that the user can access (required)
// #### options['instance'] {string | Object} The instance could be the ID for the instance or a instance of Instance class (required)
exports.createUser = function createUser (options, callback) {
  var self = this,
      databases = [];

  // @todo make possible accept
  // an Array as options for create 
  // multiple users.

  // Check for options
  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create an instance.'
    }), options);
  }

  // Check for required options.
  ['username', 'password', 'database', 'instance'].forEach(function (required) {
    if (!options[required]) {
      errs.handle(errs.create({
        message: 'Options. ' + required + ' is a required argument'
      }), callback);
    }
  });

  // If 'databases' is an array so we push each name in databases list
  if (options && options['databases'] &&
      typeof options['databases'] === 'array' &&
      options['databases'].length > 0) {
    options['databases'].forEach(function (item, idx) {
      if (typeof item === 'string') {
        databases.push(item);
      } else if (item instanceof Database) {
        databases.push(item.name);
      }
    });
  }

  if (options && options['databases'] && typeof options['databases'] === 'string') {
    databases.push(options['databases']);
  }

  if (options && options['databases'] && options['databases'] instanceof Database) {
    databases.push(options['databases'].name);
  }

  var instanceId = options['instance'] instanceof Instance ? options['instance'].id : options['instance'];

  // @todo Regexp for sanitize the Username, Pwd and db name.

  // @todo Make length restrictions according the rackspace limits

  var createOptions = {
    method: 'POST',
    path: 'instances/' + instanceId + '/users',
    body: {
      users: [ {
        name: options['username'],
        password: options['password'],
        databases: databases
      } ]
    }
  };

  this.request(createOptions, callback, function (body, response) {
    callback(null, response);
  });
};

// Get the list of users for an Instance
// Need an Instance
// ### @options {Object} Set of options can be
// #### options['instance'] {string | Object} Could be the ID for the instance or a instance of Instance class (required)
// #### options['limit'] {Integer} Number of results you want
// #### options['offset'] {Integer} Offset mark for result list
// ### @callback {Function} Function to continue the call is cb(error, instances, offset)
exports.getUsers = function getUsers (options, callback) {
  var self = this,
      completeUrl = {};

  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  // Check for instance
  if (!options['instance']) {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), Array.prototype.sinstancelice.call(arguments).pop());
  }
  // The limit parameter for truncate results
  if (options && options.limit) {
    completeUrl.limit = options.limit;
  }
  // The offset
  if (options && options.offset) {
    completeUrl.marker = options.offset;
  }

  var instanceId = options['instance'] instanceof Instance ? options['instance'].id : options['instance'];

  this.request('instances/' + instanceId + '/users?' + qs.stringify(completeUrl), callback, function (body, res) {
    var marker = null;

    if (body.links && body.links.length > 0) {
      marker = qs.parse(body.links[0].href.split('?').pop()).marker;
    }

    callback(null, body.users.map(function (result) {
      return new User(self, result);
    }), marker);
  });
};

// Destroying the user
// Need an Instance and the user
// #### @instance {string | Object} Could be the ID for the instance or a instance of Instance class (required)
// #### @user {string | Object} Could be the name of the user or a instance of User class (required)
exports.destroyUser = function destroyUser (instance, user, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  // Check for user
  if (typeof user === 'function') {
    return errs.handle(errs.create({
      message: 'An user is required.'
    }), user);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;
  var userId = user instanceof User ? user.name : user;

  this.request('DELETE', 'instances/' + instanceId + '/users/' + userId, callback, function (body, response) {
    return callback(null, response);
  });
};

// Enable the root user on a instance
// #### @instance {string | Object} Could be the ID for the instance or a instance of Instance class (required)
exports.enableRoot = function enableRoot (instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var self = this;
  var instanceId = instance instanceof Instance ? instance.id : instance;

  this.request('POST', 'instances/' + instanceId + '/root', callback, function (body, response) {
    return callback(null, new User(self, body.user), response);
  });
};

// Check the flag for root user access
// #### @instance {string | Object} Could be the ID for the instance or a instance of Instance class (required)
exports.rootEnabled = function rootEnabled (instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;

  this.request('/instances/' + instanceId + '/root', callback, function (body, response) {
    return callback(null, body.rootEnabled, response);
  });
};
