/*
 * index.js: Compute client for DigitalOcean API
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile        = require('utile'),
    urlJoin      = require('url-join'),
    digitalocean = require('../../client'),
    Event        = require('../event').Event;

var Client = exports.Client = function (options) {
  digitalocean.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));
};

utile.inherits(Client, digitalocean.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  var root = this.serversUrl
    ? this.protocol + this.serversUrl
    : this.protocol + 'api.digitalocean.com';

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};

Client.prototype._asyncRequest = function (options, callback) {
  var self = this;

  return self.request(options, function (err, body, res) {
    if (err || !body.event_id) {
      return callback(err, body, res);
    }

    var event = new Event(self, { id: body.event_id });
    event.setWait({ status: 'done' }, 1000, function (err, results) {
      if (err) {
        return callback(err);
      }

      callback(null, body, res);
    });
  });
};
