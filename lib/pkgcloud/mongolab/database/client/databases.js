/*
 * database.js: Database methods for working with databases from MongoLab
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    qs       = require('querystring'),
    url      = require('url');


// Function formatResponse
// This function parse the response from the provider and return an object
// with the correct keys and values.
// ### @response {Object} The body response from the provider api
function formatResponse (response) {
  var info, user, dbname;
  info   = url.parse(response.uri);
  user   = info.auth.split(':');
  dbname = info.pathname.split('_').pop();

  var database = {
    id: dbname,
    host: info.hostname,
    port: Number(info.port),
    uri: 'mongodb://' + info.auth + '@' + info.host,
    username: user[0],
    password: user[1],
    dbname: dbname
  };
  return database;
}

// Create Database
// ### @options {Object} Set of options can be
// #### options['name'] {String} Name of database (required)
// #### options['owner'] {String} Name of the user owner the database (required)
// #### options['plan'] {String} Name of plan according to the MongoLab plans (Default: 'free')
// ### @callback {Function} Continuation to respond to when complete.
exports.createDatabase = function createDatabase (options, callback) {
  // Check for options
  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create a database.'
    }), options);
  }

  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. Name is a required argument'
    }), callback);
  }

  if (!options['owner']) {
    return errs.handle(errs.create({
      message: 'options. Owner is a required argument'
    }), callback);
  }

  if (!options['plan']) {
    options['plan'] = 'free';
  }

  // We have to setup the correct prefix for database name
  // for the moment we use the 'owner' field because we expect the correct prefix there.
  var databaseName = [options['owner'], options['name']].join('_');

  // Setup the account name according mongolab API.
  // @todo We need a helper function for add the prefix if its necesary
  //var account = [this.config.username, options['owner']].join('_');
  var account = options['owner'] // at the moment we need provide the username with the prefix (partner name)

  var createOptions = {
    method: 'POST',
    path: 'accounts/' + account + '/databases',
    body: {
      name: databaseName,
      plan: options['plan'],
      username: options['owner'],
      // In future we will have to change this for support multiples clouds and user-selected cloud.
      cloud: this.config.cloud
    }
  }

  this.request(createOptions, callback, function (body, response) {
    return callback(null, formatResponse(body));
  });
};

// Create Account
// ### @options {Object} Set of options can be
// #### options['name'] {string} Name of account (required)
// #### options['email'] {string} Email of the owner of the account (required)
// #### options['password'] {string} Password for the account (Optional), If not specify so mongolab will generate one.
// ### @callback {Function} Continuation to respond to when complete.
exports.createAccount = function createAccount (options, callback) {
  // Check for options
  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create an account.'
    }), options);
  }

  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. Name is a required argument'
    }), callback);
  }

  if (!options['email']) {
    return errs.handle(errs.create({
      message: 'options. Email is a required argument'
    }), callback);
  }

  // Add support for the displayName input for mongolab
  // https://objectlabs.jira.com/wiki/display/partners/MongoLab+Partner+Integration+API#MongoLabPartnerIntegrationAPI-Createaccount.1

  var adminUser = { email: options['email'] };

  if (options['password']) {
    if (/[+\d]/g.test(options['password'])) {
      adminUser['password'] = options['password'];
    } else {
      return errs.handle(errs.create({
        message: 'options. Password must contain at least one numeric character.'
      }), callback);
    }
  }

  var createOptions = {
    method: 'POST',
    path: 'accounts',
    body: {
      name: [this.config.username, options['name']].join('_'),
      adminUser: adminUser
    }
  }

  this.request(createOptions, callback, function (body, response) {
    return callback(null, { account: body.adminUser });
  })
};

// Delete Account
// ### @name {String} Name of the account to be deleted
// ### @callback {Function} Continuation to respond to when complete.
exports.deleteAccount = function deleteAccount (name, callback) {
  // Check for options
  if (typeof name === 'function') {
    return errs.handle(errs.create({
      message: 'Name required for delete an account.'
    }), name);
  }

  var deleteOptions = {
    method: 'DELETE',
    path: 'accounts/' + name
  }

  this.request(deleteOptions, callback, function (body, response) {
    return callback(null, response);
  });
};

// Lists all databases by user account
// ### @owner {String} Username for list their databases
// ### @callback {Function} Continuation to respond to when complete.
exports.getDatabases = function getDatabases (owner, callback) {
  // Check for options
  if (typeof owner === 'function') {
    return errs.handle(errs.create({
      message: 'Name required for delete an account.'
    }), owner);
  }

  this.request({ path:'accounts/' + owner + '/databases' }, callback, function (body, response) {
    return callback(null, body);
  });
};

// View one database with details
// NOT USE THIS METHOD YET
// The principal idea of this method is for view details like username and
// password and the hostname and port, but for now MongoLab just answer with the name.
// The behavior I describe its according the parters documentation.
// https://objectlabs.jira.com/wiki/display/partners/MongoLab+Partner+Integration+API#MongoLabPartnerIntegrationAPI-Viewdatabase
// ### @options {Object} Set of options can be
// #### options['name'] {String} Name of the database to view (required)
// #### options['owner'] {String} Username of the database owner (required)
// ### @callback {Function} Continuation to respond to when complete.
exports.getDatabase = function getDatabase (options, callback) {
  // Check for options
  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for view a database.'
    }), options);
  }

  // Check for name
  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. Name is a required argument.'
    }), callback);
  }

  // Check for owner
  if (!options['owner']) {
    return errs.handle(errs.create({
      message: 'options. Username of owner is a required argument.'
    }), callback);
  }

  this.request({ path: 'accounts/' + options['owner'] + '/databases/' + options['name'] }, callback, function (body, response) {
    return callback(null, body);
  });
};

// Delete a database
// ### @options {Object} Set of options can be
// #### options['name'] {String} Name of the database to view (required)
// #### options['owner'] {String} Username of the database owner (required)
// ### @callback {Function} Continuation to respond to when complete.
exports.deleteDatabase = function deleteDatabase (options, callback) {
  // Check for options
  if (typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for delete a database.'
    }), options);
  }

  // Check for name
  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. Name is a required argument.'
    }), callback);
  }

  // Check for owner
  if (!options['owner']) {
    return errs.handle(errs.create({
      message: 'options. Username of owner is a required argument.'
    }), callback);
  }

  var deleteOptions = {
    method: 'DELETE',
    path: 'accounts/' + options['owner'] + '/databases/' + options['name']
  }

  this.request(deleteOptions, callback, function (body, response) {
    callback(null);
  });
};
