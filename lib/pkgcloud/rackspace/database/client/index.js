/*
 * client.js: Database client for Rackspace Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    request   = require('request'),
    rackspace = require('../../client'),
    auth      = require('../../../common/auth.js');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  this.before.push(auth.accountId);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./instances'));
  utile.mixin(this, require('./databases'));
  utile.mixin(this, require('./users'));
};

utile.inherits(Client, rackspace.Client);

Client.prototype.url = function url () {
  var args = Array.prototype.slice.call(arguments);
  return [
    'https://ord.databases.api.rackspacecloud.com',
    'v1.0',
    (this.config.accountNumber) ? this.config.accountNumber : ''
  ].concat(args).join('/');
};

// Using own auth for Databases Client
Client.prototype.auth = function auth (callback) {
  var self = this;

  var authOptions = {
    uri: 'https://' + this.authUrl + '/v1.1/auth',
    headers: {
      'HOST': this.authUrl,
      'X-AUTH-USER': this.config.username,
      'X-AUTH-KEY': this.config.apiKey
    },
    body: {
      "credentials": {
        "username": this.config.username,
        "key": this.config.apiKey
      }
    },
    json: true,
    method: 'POST'
  };

  function serviceDefault (server) {
    return (server.v1Default);
  }

  request(authOptions, function (err, res, body) {
    if (err) return callback(err);
    if (res.body.unauthorized && 
      res.body.unauthorized.message) return callback(res.body);

    var headers = {},
        services = body.auth.serviceCatalog,
        isDefault = function (server) { return server.v1Default; },
        getUrl = function (list) { var selected = list.filter(isDefault)[0]; return selected.publicURL; },
        servers = {"cdnUrl": getUrl(services.cloudFilesCDN),
          "storageUrl": getUrl(services.cloudFiles),
          "serverUrl": getUrl(services.cloudServers)
        };
    
    if (res.statusCode === 200 && body.auth) {
      self.authorized = true;
      self.config.authToken = body.auth.token.id;
      self.config.accountNumber = servers.serverUrl.split('/').pop();
      utile.mixin(self.config, servers);

      // Compatibility with v1.0 tests
      headers['x-server-management-url'] = servers.serverUrl;
      headers['x-storage-url'] = servers.storageUrl;
      headers['x-cdn-management-url'] = servers.cdnUrl;
      headers['x-auth-token'] = body.auth.token.id;
      utile.mixin(res.headers, headers);
    }
    callback(err, res);
  });
};


//
// Gets the version of the Rackspace CloudServers API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion (callback) {
  var versionOptions = {
    uri: 'https://' + this.serversUrl,
  };

  request(versionOptions, function (err, res, body) {
    return callback(null,
      ((typeof body === 'object') ? body.versions : JSON.parse(body).versions));
  });
};
