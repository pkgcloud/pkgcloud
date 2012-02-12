/*
 * client.js: Database client for Rackspace Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
};

utile.inherits(Client, rackspace.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [
    'https://ord.databases.api.rackspacecloud.com'
  ].concat(args).join('/');
};

// Using own auth for Databases Client
Client.prototype.auth = function (callback) {
  var self = this;

  var authOptions = {
    uri: 'https://' + this.authUrl + '/v1.1/auth',
    headers: {
      'HOST': this.authUrl,
      'X-AUTH-USER': this.config.auth.username,
      'X-AUTH-KEY': this.config.auth.apiKey
    },
    body: {
      "credentials": {
        "username": this.config.auth.username,
        "key": this.config.auth.apiKey
      }
    },
    json: true,
    method: 'POST'
  };

  request(authOptions, function (err, res, body) {
    if (err) return callback(err);
    if (res.statusCode === 200) {

console.log('Respuesta AUTH',res);
    self.authorized = true;
    self.config.authToken = res.body.auth.token.id;
    }

    callback(null, res);
  });
};


//
// Gets the version of the Rackspace CloudServers API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function (callback) {
  var versionOptions = {
    uri: 'https://' + this.serversUrl,
  };

  request(versionOptions, function (err, res, body) {
  console.log('Versiones',body);
    callback(null, JSON.parse(body).versions);
  });
};
