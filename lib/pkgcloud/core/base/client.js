/*
 * client.js: Base client from which all pkgcloud clients inherit from
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    events = require('eventemitter2'),
    request = require('request'),
    utile = require('utile'),
    qs = require('querystring'),
    common = require('../../common'),
    pkgcloud = require('../../../pkgcloud'),
    errs = require('errs');

/**
 * Client
 *
 * @description base Client from which all pkgcloud clients inherit
 *
 * @param {object}    options   options are stored as client.config
 * @type {Function}
 */
var Client = exports.Client = function (options) {
  events.EventEmitter2.call(this, { delimiter: '::', wildcard: true });
  this.config = options || {};
};

utile.inherits(Client, events.EventEmitter2);

/**
 * Client.request
 *
 * @description is the global request handler for a pkgcloud client request.
 *
 * @param {object}          options     options for this client request
 * @param {Function}        callback    the callback for the client request
 */
Client.prototype.request = function (options, callback) {
  return this._doRequest(options, callback);
};

/**
 * Client._doRequest
 *
 * @description Private function that handles the prepared payload and then
 * spawns the request. Some clients can override this function, for example
 * rackspace and openstack providers implement an inline authentication.
 *
 * @param {object}    options   the prepared options from Client.request
 * @param {Function}  callback  the callback for the request
 * @returns {*}
 * @private
 */
Client.prototype._doRequest = function (options, callback) {
  var self = this;

  var requestOptions = {};

  requestOptions.method = options.method || 'GET';
  requestOptions.headers = options.headers || {};
  requestOptions.path = options.path

  if (options.qs) {
    requestOptions.qs = options.qs;
  }

  if (options.body) {
    requestOptions.body = options.body;
  }

  if (options.container) {
    requestOptions.signingUrl = '/' + options.container + '/';

    if (options.path) {
      requestOptions.signingUrl += options.path;
    }
  }


  function sendRequest(opts) {

    //
    // Setup any specific request options before
    // making the request
    //
    if (self.before) {
      var errors = false;
      for (var i = 0; i < self.before.length; i++) {
        var fn = self.before[i];
        try {
          opts = fn.call(self, opts) || opts;
          // on errors do error handling, break.
        } catch (exc) {
          errs.handle(exc, callback);
          errors = true;
          break;
        }
      }
      if (errors) {
        return;
      }
    }

    opts.uri = options.uri || self.getUrl(options);

    //console.log((opts.method ? opts.method : 'GET') + ': ' + opts.uri + (opts.qs ? '?' + qs.encode(opts.qs) : ''));

    // Clean up our polluted options
    //
    // TODO refactor the options used in Before methods
    // to not require polluting request options
    //
    delete opts.path;
    delete opts.signingUrl;

    // Set our User Agent
    opts.headers['User-Agent'] = utile.format('nodejs-pkgcloud/%s', pkgcloud.version);

    // If we are missing either the errback or callback
    if (!callback) {
      try {
        return request(opts);
      } // if request throws still return an EE
      catch (exc1) {
        return errs.handle(exc1);
      }
    } else {
      try {
        return request(opts, handleRequest);
      } catch (exc2) {
        return errs.handle(exc2, callback);
      }
    }
  }

  function handleRequest(err, res, body) {
    if (err) {
      return callback(err);
    }

    var statusCode = res.statusCode.toString(),
        err2;

    if (Object.keys(self.failCodes).indexOf(statusCode) !== -1) {
      //
      // TODO: Support more than JSON errors here
      //
      err2 = {
        provider: self.provider,
        failCode: self.failCodes[statusCode],
        message: self.provider + ' Error (' +
          statusCode + '): ' + self.failCodes[statusCode]
      };

      try {
        err2.result = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (e) {
        err2.result = { err: body };
      }

      return callback(errs.create(err2));
    }

    callback(err, body, res);
  }

  return sendRequest(requestOptions);
};
