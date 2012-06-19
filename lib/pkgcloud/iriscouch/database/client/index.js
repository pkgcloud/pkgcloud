/*
 * client.js: Database client for Iriscouch Cloud Databases
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

Client.prototype.create = function (options, callback) {
  var self = this,
    couch = {
      _id:      "Server/" + options.subdomain,
      partner:  this.username,
      creation: {
        "first_name": options.first_name,
        "last_name": options.last_name,
        "email": options.email,
        "subdomain": options.subdomain
      }
  };
  options = {
    uri    : this.url(),
    method : 'POST',
    body   : JSON.stringify(couch),
    followRedirect: false,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Basic " + utile.base64.encode(this.username + ':' + this.password)
    }
  };
  request(options, function (err, response, body) {
    if (err) {
      return callback(err);
    }
    var result = JSON.parse(body);
    if (response.statusCode === 201) {
      if (result.ok === true) {
        //
        // Remark: Begin polling iriscouch to determine when the couch database is ready.
        //
        self._checkCouch(options.subdomain, function (err, result) {
          callback(err, result);
        });
      }
      else {
        callback("There was an issue creating the couch", { "created": false });
      }
    }
    else if (response.statusCode === 403 || response.statusCode === 401 || response.statusCode === 302) {
      callback("incorrect partner name or password.", { "created": false });
    }
    else if (response.statusCode === 409) {
      callback("subdomain is already taken.", { "created": false });
    }
    else {
      callback("unknown error", { "created": false });
    }
  });
};

Client.prototype.url = function url () {
  return 'https://hosting.couchone.com/hosting_public';
};

Client.prototype._checkCouch = function (couchName, callback) {
  //
  // Remark: Poll the couch with a GET every interval to determine if couch is up yet
  // We perform a poll since there is no real database available notification event from couchone
  //
  var interval = 500,
      maxAttempts = 5,
      count = 0,
      options = {
        uri    : 'http://' + couchName + '.couchone.com/',
        method : 'GET',
        followRedirect: false,
        headers: {
          'Content-Type': 'application/json'
        }
      },
  t = function () {
    count = count + 1;
    if (count > maxAttempts) {
      return callback("Max Attempts hit", { "created": false });
    }
    request(options, function (err, response, body) {
      if (err) {
        return callback(err, { "created": false });
      }
      if (response.statusCode === 200) {
        return callback(null, { "created": true });
      }
      setTimeout(t, interval);
    });
  };
  t();
};
