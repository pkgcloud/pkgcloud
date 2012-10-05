/*
 * client.js: Database client for Iriscouch Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    request   = require('request'),
    errs      = require('errs');

var Client = exports.Client = function (options) {
  this.username = options.username;
  this.password = options.password;
};

Client.prototype.create = function (attrs, callback) {
  // Check for options.
  if (!attrs || typeof attrs === 'function') {
    return errs.handle(errs.create({
      message: 'Options required for create a database.'
    }), Array.prototype.slice.call(arguments).pop());
  }
  // Check for obligatory fields
  if (!attrs['first_name'] || !attrs['last_name']) {
    return errs.handle(errs.create({
      message: 'Options.  first_name and last_name are required arguments'
    }), Array.prototype.slice.call(arguments).pop());
  }

  if (!attrs['subdomain'] || !attrs['email']) {
    return errs.handle(errs.create({
      message: 'Options.  subdomain and email are required arguments'
    }), Array.prototype.slice.call(arguments).pop());
  }

  var self = this,
    couch = {
      _id:      "Server/" + attrs.subdomain,
      partner:  this.username,
      creation: {
        "first_name": attrs.first_name,
        "last_name": attrs.last_name,
        "email": attrs.email,
        "subdomain": attrs.subdomain
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

    if (response.statusCode === 201) {
      if (body.ok === true) {
        //
        // Remark: Begin polling iriscouch to determine when the couch database is ready.
        //
        self._checkCouch(attrs.subdomain, function (err, response) {
          response.subdomain = attrs.subdomain;
          var database = self.formatResponse(response);
          callback(err, database);
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

Client.prototype.formatResponse = function (response) {
  var database = {
    id: response.subdomain,
    port: 80,
    host: response.subdomain + '.iriscouch.com',
    uri: 'http://' + response.subdomain + '.iriscouch.com/',
    username: '',
    password: ''
  };
  return database;
};

Client.prototype.url = function () {
  return 'https://hosting.iriscouch.com/hosting_public';
};

Client.prototype._checkCouch = function (couchName, callback) {
  //
  // Remark: Poll the couch with a GET every interval to determine if couch is up yet
  // We perform a poll since there is no real database available notification event from couchone
  //
  var interval = 500,
      maxAttempts = 10,
      count = 0,
      options = {
        uri    : 'http://' + couchName + '.iriscouch.com/',
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

Client.prototype.destroy = function (id, callback) {
  callback("Destroy method not available for iriscouch.");
};
