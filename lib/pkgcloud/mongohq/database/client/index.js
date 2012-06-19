/*
 * client.js: Database client for Rackspace Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    request   = require('request');

var Client = exports.Client = function (options) {

  this.home     = options.home;
  this.username = options.username;
  this.password = options.password;

};

Client.prototype.url = function url () {
  return "https://mongohq.com/provider/resources";
};


//
// Wrapper for all http requests with MongoHQ
//

Client.prototype._request = function(options, callback){
  request(options, function (err, response, body) {
    if(err){
      return callback(err);
    }

    if(response.statusCode == 401 || response.statusCode == 403){
      return callback("Unauthorized");
    }
    try {
      return callback(null, JSON.parse(body));
    } catch (e) {
      return callback(null, body);
    }
  }); 
};

Client.prototype.create = function(options, callback){
  var options = {
    uri     : this.url(),
    method  : 'POST',
    body    : 'app_id=' + options.name + '&plan=' + options.plan,
    headers : {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password)
    }
  };
  this._request(options, callback);
};

//
//  Removes one mongo instance by id
//
Client.prototype.remove = function(id, callback){
  var options = {
    uri    : this.url() + '/' + id,
    method : 'DELETE',
    headers: {
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password),
      'Content-Length': 0
    }
  };
  
  this._request(options, function (err, result) {
    if (err !== null || result === "OK") {
      return callback(err);
    }
    return callback("NOT OK!!!! result: " + result );
  });
};