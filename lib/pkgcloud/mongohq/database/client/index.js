/*
 * client.js: Database client for MongoHQ Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    url       = require('url'),
    request   = require('request'),
    errs      = require('errs');

var Client = exports.Client = function (options) {
  this.home     = options.home;
  this.username = options.username;
  this.password = options.password;
};

Client.prototype.url = function () {
  return "https://mongohq.com/provider/resources";
};

//
// Wrapper for all http requests with MongoHQ
//
Client.prototype._request = function (options, callback) {
  var self = this;
  request(options, function (err, response, body) {
    if(err){
      return callback(err);
    }
    if(response.statusCode == 401 || response.statusCode == 403){
      return callback("Unauthorized");
    }
    if(options.method !== "DELETE") {
      var database;
      try {
        database = JSON.parse(body);
      } catch (e) {
        return callback("Bad response from server.", body);
      }
      database = self.formatResponse(database);
      return callback(null, database);
    } else {
      return callback(null, 'deleted');
    }
  });
};

//  Create a new Database at mongohq
//  Need Name and select a plan.
//  ### @attrs {Object} pair of name an plan values.
//  ##### @attrs['name'] {String} Name of the new database.(required)
//  ##### @attrs['plan'] {String} Name of the plan selected for database.(required)
Client.prototype.create = function (attrs, callback) {
  // Check for options
  if (!attrs || typeof attrs === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create a database.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  // Check for name and plan
  if (!attrs['name'] || !attrs['plan']) {
    return errs.handle(errs.create({
      message: 'options. Name and plan are required arguments'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var options = {
    uri     : this.url(),
    method  : 'POST',
    body    : 'app_id=' + attrs.name + '&plan=' + attrs.plan,
    headers : {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password)
    }
  };
  this._request(options, callback);
};

//
//  Removes one mongo instance by id
//  ### @id {String} ID of the instance to remove.
Client.prototype.destroy = function (id, callback) {
  // Check for id
  if (!id || typeof id === 'function') {
    return errs.handle(errs.create({
      message: 'ID is a required argument'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var options = {
    uri    : this.url() + '/' + id,
    method : 'DELETE',
    headers: {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password),
      'Content-Length': 0
    }
  };
  this._request(options, callback);
};

Client.prototype.formatResponse = function (response) {
  var info, user, dbname, database;
  info   = url.parse(response.config.MONGOHQ_URL);
  user   = info.auth.split(':');
  dbname = info.pathname.replace('/', ''),
  database = {
    id: response.id,
    port: Number(info.port),
    host: info.hostname,
    uri: 'mongodb://' + info.auth + '@' + info.host,
    username: user[0],
    password: user[1],
    dbname: info.pathname
  };
  return database;
};