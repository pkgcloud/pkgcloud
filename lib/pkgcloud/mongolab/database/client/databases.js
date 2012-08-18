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
exports.create = function create (options, callback) {};