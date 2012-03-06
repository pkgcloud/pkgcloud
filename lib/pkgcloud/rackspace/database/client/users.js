/*
 * users.js: Client methods for working with users on database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var Database = require('../database').Database,
    Instance = require('../instance').Instance,
    User = require('../user').User;

// Create a User for a Database.
// Need an Instance and a Database name.
exports.createUser = function (options, callback) {
  var self = this,
      databases = [];
      
  // @todo make possible accept
  // an Array as options for create 
  // multiple users.

  ['username', 'password', 'database'].forEach(function (required) {
    if (!options[required]) throw new Error('options. ' + required + ' is a required argument');
  });

  if (typeof options['databases'] === 'array' && options['databases'].length > 0) {
    options['databases'].forEach(function (item, idx) {
      if (typeof item === 'string') {
        databases.push(item);
      }
    });
  }
  
  if (typeof options['databases'] === 'string') {
    databases.push(options['databases']);
  }
  
  if (options['databases'] instanceof Database) {
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

  this.request(createOptions, callback, function(body, response) {
    callback(null, response);
  });
};

// Get the list of users for an Instance
// Need an Instance
exports.getUsers = function getUsers (instance, callback) {
  var self = this;
  var instanceId = instance instanceof Instance ? instance.id : instance;

  this.request('instances/' + instanceId + '/users', callback, function (body, res) {
    callback(null, body.users.map(function (result) {
      return new User(self, result);
    }), res);
  });
};
