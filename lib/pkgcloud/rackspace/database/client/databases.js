/*
 * database.js: Database methods for working with database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var Database = require('../database').Database,
    Instance = require('../instance').Instance;

// Create Database within a Instance
// Need a Instance
exports.createDatabase = function (options, callback) {
  var self = this;

  if (!options['name']) return callback(new Error('options. Name is a required argument'));
  if (!options['instance']) return callback(new Error('options. Instance is a required argument'));

  // @todo Add support for handle and array of names for create multiple databases

  var instanceId = options['instance'] instanceof Instance ? options['instance'].id : options['instance'];
  
  var reqDatabase = { name: options['name'] };
  
  if (options['character_set']) reqDatabase['character_set'] = options['character_set'];
  if (options['collate']) reqDatabase['collate'] = options['collate'];

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
exports.getDatabases = function (instance, callback) {
  var instanceId = instance instanceof Instance ? instance.id : instance;

  this.request('instances/' + instanceId + '/databases', callback, function (body, response) {
    return callback(null, body.databases, response);
  });
};

// Deleting a database within an instance
exports.destroyDatabase = function (database, instance, callback) {
  var instanceId = instance instanceof Instance ? instance.id : instance;
  var databaseName = database instanceof Database ? database.name : database;

  this.request('DELETE', 'instances/' + instanceId + '/databases/' + databaseName, callback, function (body, response) {
    return callback(null, response);
  });
};
