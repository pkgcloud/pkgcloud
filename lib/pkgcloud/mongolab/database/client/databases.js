/*
 * database.js: Database methods for working with databases from MongoLab
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    qs       = require('querystring');

// Create Database
// ### @options {Object} Set of options can be
// #### options['name'] {string} Name of database (required)
// #### options['owner'] {string} Name of the user owner the database (required)
// #### options['plan'] {string} Name of plan according to the MongoLab plans (Default: 'free')
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

  // Setup the account name according mongolab API.
  var account = [this.config.username, options['owner']].join('_');

  var createOptions = {
    method: 'POST',
    path: 'accounts/' + account + '/databases',
    body: {
      name: options['name'],
      plan: options['plan'],
      username: options['owner']
    }
  }

  this.request(createOptions, callback, function (body, response) {
      // Work in progress here.
      // We need create the owner account before create any database.
  });
};

// Create Account
// ### @options {Object} Set of options can be
// #### options['name'] {string} Name of account (required)
// #### options['email'] {string} Email of the owner of the account (required)
// #### options['password'] {string} Password for the account (Optional), If not specify so mongolab will generate one.
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
    adminUser['password'] = options['password'];
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
    return callback(null, { account: response.adminUser });
  })
};