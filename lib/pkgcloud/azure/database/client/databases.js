/*
 * database.js: Database methods for working with databases from Azure Tables
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var errs = require('errs'),
  async = require('async'),
  templates = require('../../utils/templates'),
  PATH = require('path'),
  _ = require('underscore'),
  url = require('url');

exports.create= function (options, callback) {

  var params = {},
    headers = {},
    self = this,
    body;

  if (!options || typeof options === 'function') {
    return errs.handle(errs.create({
      message: 'Options required to create a database.'
    }), Array.prototype.slice.call(arguments).pop());
  }

  // Check for name
  if (!options['name']) {
    return errs.handle(errs.create({
      message: 'options. name is a required option'
    }), Array.prototype.slice.call(arguments).pop());
  }

  params.name = options.name;
  params.date = new Date().toISOString();

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      var path = PATH.join(__dirname, 'templates/createTable.xml');
      console.log(path);
      templates.load(path, next);
    },
    function(template, next){
      // compile template with params
      body = _.template(template, params);
      //console.log(body);
      headers['content-length'] = body.length;
      self.request({
        method: 'POST',
        path: ['Tables'],
        body:body,
        headers: headers
      }, next, function (body, res) {
        next(null,body)
      });
    }],
    function (err, result) {
      callback(err, result);
    }
  );
};

exports.getTables= function (callback) {
  this.xmlRequest('GET', ['Tables'], callback, function (body, res) {
    callback(null,body)
  });
};

exports.delete= function (table, callback) {

  var path = encodeTableUriComponent("Tables('" + table + "')");
  this.xmlRequest('DELETE', [path], callback, function (body, res) {
    callback(null,res)
  });
};

// Function formatResponse
// This function parse the response from the provider and return an object
// with the correct keys and values.
// ### @response {Object} The body response from the provider api
function formatResponse (response) {
  var info, user, dbname, database, auth;
  info   = url.parse(response.config.MONGOHQ_URL);
  auth	 = encodeURIComponent(info.auth);
  user   = auth.replace(/%3A/i, ':').split(':');
  dbname = info.pathname.replace('/', ''),
    database = {
      id: response.id,
      port: Number(info.port),
      host: info.hostname,
      uri: 'mongodb://' + info.auth + '@' + info.host,
      username: decodeURIComponent(user[0]),
      password: decodeURIComponent(user[1]),
      dbname: dbname
    };
  return database;
};


//
//  Removes one mongo instance by id
//  ### @id {String} ID of the instance to remove.
exports.remove = function remove (id, callback) {
  // Check for id
  if (!id || typeof id === 'function') {
    return errs.handle(errs.create({
      message: 'ID is a required argument'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var deleteOptions = {
    path   : ['resources', id],
    method : 'DELETE'
  };

  this.request(deleteOptions, callback, function (body, response) {
    callback(null, 'deleted');
  });
};

var encodeTableUriComponent = function (uri) {
  return encodeURIComponent(uri)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
};