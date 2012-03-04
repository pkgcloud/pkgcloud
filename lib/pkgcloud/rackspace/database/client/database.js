/*
 * database.js: Database methods for working with database within instances from Rackspace Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var Database = require('../database').Database,
    Instance = requrie('../instance').Instance;

// Create Database within a Instance
// Need a Instance
exports.createDatabase = function (options, callback) {
  var self = this;

  if (!options['name']) throw new Error('options. name is a required argument');
  
  console.log(typeof options);

/**
  if (typeof options['databases'] === 'array' && options['databases'].length > 0) {
    options['databases'].forEach(function (item, idx) {
      if (typeof item === 'string') {
        options['databases'][idx] = {
          name: item,
          character_set: "utf8",
          collate: 'utf8_general_ci'
        }
      }
    });
  }
  **/

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
  console.log('Create', createOptions);
/**
  this.request(createOptions, callback, function(body, response) {
    var instance = new Instance(self, body.instance);
    callback(null, instance);
  });
  **/
};