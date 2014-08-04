/*
 * users.js: Client methods for working with users on database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

/**
 * @module databases
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    Database = pkgcloud.providers.rackspace.database.Database,
    Instance = pkgcloud.providers.rackspace.database.Instance,
    User     = pkgcloud.providers.rackspace.database.User,
    errs     = require('errs'),
    async    = require('async'),
    qs       = require('querystring');


/**
 * client.createUser
 * @description Create User(s) for an Instance
 * This is currently broken v.0.9.6
 *
 * @param {Object[]}            object          Either a User object or array of User objects
 * @param {String}              object.username Name of user
 * @param {String}              object.password Password for user
 * @param {String[]}            object.database Either ID(s) or instance(s) of Database user can access
 * @param {String|object}       object.instance Either ID or instance of Instance
 * @param {Function}            callback ( error, response )
 */
exports.createUser = function createUser(options, callback) {
  var self = this,
      users = [],
      regex = /^\s|^\?|^@|^#| \w* \d* |'|"|`|;|,|\\|\/| \s$/,
      instanceId,
      count = 0;

  // Check for options
  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create an instance.'
    }), options);
  }

  // Not as clean as I'd like but async didn't seem to work properly.
  if (options instanceof Array) {
    for (var i = 0; i < options.length; i++) {
      assessOptions(options[i]);
    }
  }
  else {
    assessOptions(options);
  }

  function assessOptions(opts) {
    var databases = [],
      calledBack = false;

    // Check for required options.
    ['username', 'password', 'database', 'instance'].forEach(function (required) {
      if (!opts[required]) {
        if (calledBack) { return; }
        errs.handle(errs.create({
          message: 'Options. ' + required + ' is a required argument'
        }), callback);
        calledBack = true;
      }
    });

    if (calledBack) {
      return;
    }

    // Check for invalid characters in username and password
    if (regex.test(opts['username'])) {
      return errs.handle(errs.create({
        message: 'Invalid characters in username ' + opts['username']
      }), callback);
    }
    if (regex.test(opts['password'])) {
      return errs.handle(errs.create({
        message: 'Invalid characters in password ' + opts['password']
      }), callback);
    }
    // Check username character limit
    if (opts['username'].length > 16) {
      return errs.handle(errs.create({
          message: 'Username character limit is 16'
        }), callback);
    }

    // If 'databases' is an array so we push each name in databases list
    if (opts && opts['databases'] &&
        opts['databases'] instanceof Array &&
        opts['databases'].length > 0) {
      opts['databases'].forEach(function (item, idx) {
        if (typeof item === 'string') {
          databases.push(item);
        } else if (item instanceof Database) {
          databases.push(item.name);
        }
      });
    }

    if (opts && opts['databases'] && typeof opts['databases'] === 'string') {
      databases.push(opts['databases']);
    }

    if (opts && opts['databases'] && opts['databases'] instanceof Database) {
      databases.push(opts['databases'].name);
    }
    // Check for invalid characters and permitted length of database
    databases.forEach(function (db) {
      if (regex.test(db)) {
        return errs.handle(errs.create({
          message: 'Invalid characters in database ' + db
        }), callback);
      }
      if (db.length > 64) {
        return errs.handle(errs.create({
          message: 'Database character limit is 64'
        }), callback);
      }
    });

    instanceId = opts['instance'] instanceof Instance ? opts['instance'].id : opts['instance'];

    users.push({
      name: opts['username'],
      password: opts['password'],
      databases: databases
    });

    // Only make request once all users are added.
    if (options instanceof Array) {
      ++count;
      if (count === options.length) {
        makeRequest();
      }
    } else {
      makeRequest();
    }
  }

  function makeRequest() {
    var createOptions = {
      method: 'POST',
      path: 'instances/' + instanceId + '/users',
      body: {
        users: users
      }
    };

    self._request(createOptions, function (err, body, response) {
      return err
        ? callback(err)
        : callback(null, response);
    });
  }
};


/**
 * client.getUsers
 * @description Get the users for an Instance
 *
 * @param {object}              options
 * @param {String|object}       options.instance        Either ID or instance of Instance
 * @param {Integer}             options.limit           Number of results
 * @param {Integer}             options.offset          Offset for results
 * @param {Function}            callback ( error, instance, offset )
 */
exports.getUsers = function getUsers(options, callback) {
  var self = this,
      completeUrl = {},
      requestOptions = {};

  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), options);
  }
  // Check for instance
  if (!options['instance']) {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), Array.prototype.slice.call(arguments).pop());
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

  requestOptions.qs = completeUrl;
  requestOptions.path = 'instances/' + instanceId + '/users';

  this._request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    var marker = null;

    if (body.links && body.links.length > 0) {
      marker = qs.parse(body.links[0].href.split('?').pop()).marker;
    }

    callback(null, body.users.map(function (result) {
      return new User(self, result);
    }), marker);
  });
};


/**
 * client.destroyUser
 * @description Destroy a User
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {String|object}       user            Either name or instance of User
 * @param {Function}            callback ( error, response )
 */
exports.destroyUser = function destroyUser(instance, user, callback) {
  // Check for instance
  if (!instance || typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  // Check for user
  if (!user || typeof user === 'function') {
    return errs.handle(errs.create({
      message: 'An user is required.'
    }), user);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;
  var userId = user instanceof User ? user.name : user;

  this._request({
    method: 'DELETE',
    path: 'instances/' + instanceId + '/users/' + userId
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, response);
  });
};


/**
 * client.enableRoot
 * @description Enable the root user on an Instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error, user, response )
 */
exports.enableRoot = function enableRoot(instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var self = this;
  var instanceId = instance instanceof Instance ? instance.id : instance;

  this._request({
    method: 'POST',
    path: 'instances/' + instanceId + '/root'
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, new User(self, body.user), response);
  });
};


/**
 * client.rootEnabled
 * @description Check if root user is enabled on Instance
 *
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error, rootEnabled, response )
 */
exports.rootEnabled = function rootEnabled(instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required.'
    }), instance);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;

  this._request({
    path: '/instances/' + instanceId + '/root'
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, body.rootEnabled, response);
  });
};
