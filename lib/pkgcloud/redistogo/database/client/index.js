/*
 * client.js: Database client for RedisToGo Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    request   = require('request');

var Client = exports.Client = function (options) {
  this.username = options.username;
  this.password = options.password;
};

Client.prototype.url = function url () {
  return "https://redistogo.com";
};

//
// Wrapper for all http requests with RedisToGo
//

Client.prototype._request = function (options, callback) {
  console.log(options)
  request(options, function (err, response, body) {
    if(err){
      return callback(err);
    }
    if(response.statusCode == 401 || response.statusCode == 403){
      return callback("Unauthorized");
    }
    try{
      return callback(null, JSON.parse(body));
    } catch(e) {
      return callback('Bad response from the server');
    }
  }); 
};

Client.prototype.create = function(options, callback){
  //
  // TODO: Add validation for options.plan types
  //
  var options = {
    uri    : this.url() + '/instances.json',
    method : 'POST',
    body   : 'instance%5Bplan%5D=' + options.plan,
    headers: {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password)
    }
  };
  this._request(options, callback);
};

Client.prototype.get = function (id, callback) {
  var options,
      path = '/instances',
      self = this;
  if (id !== null) {
    path = path + '/' + id;
  }
  options = {
    uri    : this.url() + path + '.json',
    method : 'GET',
    headers: {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password)
    }
  };
  this._request(options, callback);
};

//
//  Removes one Redis instance by id
//
Client.prototype.destroy = function(id, callback){
  var options,
      path = '/instances/' + id,
      self = this;
  options = {
    uri    : this.url() + path + '.json',
    method : 'DELETE',
    headers: {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password),
      'Content-Length': 0
    }
  };
  this._request(options, callback);
};