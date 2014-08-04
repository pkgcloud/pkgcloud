/*
 * database.js: Database methods for working with database within instances from Rackspace Cloud
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
    errs     = require('errs'),
    qs       = require('querystring');



/**
 * client.createDatabase
 * @function
 * @description Create a Database within an Instance
 *
 * @param {Function|object} options
 * @param {String} options.name Name of database 
 * @param {String|object} options.instance ID of instance or Instance object 
 * @param {String} [options.character_set="utf8"] Valid MySQL CharacterSet.
 * @param {String} [options.collate="utf8_general_ci"] Valid MySQL Collate.
 * @param {Function} callback ( null, response )
 */
exports.createDatabase = exports.create = function createDatabase(options, callback) {
  var self = this;

  // Check for options
  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create a database.'
    }), options);
  }

  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. Name is a required argument'
    }), callback);
  }

  if (!options['instance']) {
    return errs.handle(errs.create({
      message: 'options. Instance is a required argument'
    }), callback);
  }

  // @todo Add support for handle and array of names for create multiple databases

  var instanceId = options['instance'] instanceof Instance ? options['instance'].id : options['instance'];

  // We setup a template for the database to create
  var reqDatabase = { name: options['name'] };

  // If is specified we set this options.
  if (options && options['character_set']) {
    reqDatabase['character_set'] = options['character_set'];
  }

  if (options && options['collate']) {
    reqDatabase['collate'] = options['collate'];
  }

  var createOptions = {
    method: 'POST',
    path: 'instances/' + instanceId + '/databases',
    body: {
      databases: [reqDatabase]
    }
  };

  this._request(createOptions, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, response);
  });
};


/**
 * client.getDatabases
 * @description List all databases in an instance
 *
 * @param {Object}              options
 * @param {String|object}       options.instance        Either ID or instance of Instance class
 * @param {Integer}             [options.limit]         Number of results
 * @param {Integer}             [options.offset]        Offset for results list
 * @param {Function}            callback ( error, instances, offset )
 */
exports.getDatabases = function getDatabases(options, callback) {
  var self = this,
      completeUrl = {},
      requestOptions = {};

  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), Array.prototype.slice.call(arguments).pop());
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
  requestOptions.path = 'instances/' + instanceId + '/databases';

  this._request(requestOptions, function (err, body, response) {
    if (err) {
      return callback(err);
    }

    var marker = null;
    if (body.links && body.links.length > 0) {
      marker = qs.parse(body.links[0].href.split('?').pop()).marker;
    }

    return callback(null, body.databases.map(function (result) {
      return new Database(self, result);
    }), marker);
  });
};


/**
 * client.destroyDatabase
 * @description Destroy a given database in an instance
 *
 * @param {String|object}       database        Either ID or instance of Database
 * @param {String|object}       instance        Either ID or instance of Instance
 * @param {Function}            callback ( error, response )
 */
exports.destroyDatabase = function destroyDatabases(database, instance, callback) {
  // Check for database
  if (typeof database === 'function') {
    return errs.handle(errs.create({
      message: 'A database is a required.'
    }), database);
  }

  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is a required for destroy databases.'
    }), instance);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;
  var databaseName = database instanceof Database ? database.name : database;

  this._request({
    method: 'DELETE',
    path: 'instances/' + instanceId + '/databases/' + databaseName
  }, function (err, body, response) {
    return err
      ? callback(err)
      : callback(null, response);
  });
};
