/*
 * database.js: Database methods for working with database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    Database = pkgcloud.providers.rackspace.database.Database,
    Instance = pkgcloud.providers.rackspace.database.Instance;

// Create Database within a Instance
// Need a Instance
// ### @options {Object} Set of options can be
// #### options['name'] {string} Name of database (required)
// #### options['instance'] {string | Object} The instance could be the ID or a instance of Instance class (required)
// #### options['character_set'] {string} Should be a valid CharacterSet for mysql. Default to 'utf8'
// #### options['collate'] {string} Should be a valid Collate for mysql. Default to 'utf8_general_ci'
// For more info about character_set and collate for mysql see http://dev.mysql.com/doc/refman/5.6/en/charset-mysql.html
exports.createDatabase = function (options, callback) {
  var self = this;

  if (!options['name']) {
    return callback(new Error('options. Name is a required argument'));
  }

  if (!options['instance']) {
    return callback(new Error('options. Instance is a required argument'));
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

  this.request(createOptions, callback, function(body, response) {
    return callback(null, response);
  });
};

// List of databases from an instance.
// #### @instance {string | Object} The instance could be the ID or a instance of Instance class (required)
exports.getDatabases = function (instance, callback) {
  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is required for get all databases.'
    }), callback);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;

  this.request('instances/' + instanceId + '/databases', callback, function (body, response) {
    return callback(null, body.databases, response);
  });
};

// Deleting a database within an instance
// #### @database {string | Object} The database could be the ID or a instance of Database class (required)
// #### @instance {string | Object} The instance could be the ID or a instance of Instance class (required)
exports.destroyDatabase = function (database, instance, callback) {
  // Check for database
  if (typeof database === 'function') {
    return errs.handle(errs.create({
      message: 'A database is a required.'
    }), callback);
  }

  // Check for instance
  if (typeof instance === 'function') {
    return errs.handle(errs.create({
      message: 'An instance is a required for destroy databases.'
    }), callback);
  }

  var instanceId = instance instanceof Instance ? instance.id : instance;
  var databaseName = database instanceof Database ? database.name : database;

  this.request('DELETE', 'instances/' + instanceId + '/databases/' + databaseName, callback, function (body, response) {
    return callback(null, response);
  });
};
