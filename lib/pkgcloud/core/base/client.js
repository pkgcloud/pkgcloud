/*
 * client.js: Base client from which all pkgcloud clients inherit from
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var events = require('eventemitter2'),
    request = require('request'),
    util = require('util'),
    qs = require('qs'),
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

util.inherits(Client, events.EventEmitter2);

/**
 * Client.setCustomUserAgent
 *
 * @description allows the caller to specify a custom prefix for the HTTP UserAgent
 * for all queries generated during the lifetime of the client.
 *
 * Valid user agents should come in the form of app-name/version, for example:
 *
 * client.setCustomUserAgent("my-app/1.2.3");
 *
 * @param {String}          userAgent   the new userAgent to be prefixed
 */
Client.prototype.setCustomUserAgent = function (userAgent) {
  this._customUserAgent = userAgent;
};

/**
 * Client.getUserAgent
 *
 * @description gets the full UserAgent for the current client
 *
 * @returns {string}
 */
Client.prototype.getUserAgent = function() {
  return util.format('%snodejs-pkgcloud/%s', this._customUserAgent ?
    this._customUserAgent + ' ' : '', pkgcloud.version);
};

/**
 * Client._request
 *
 * @description is the global request handler for a pkgcloud client request.
 * Some clients can override this function, for example
 * rackspace and openstack providers implement an inline authentication mechanism.
 *
 * @param {object}          options     options for this client request
 * @param {Function}        callback    the callback for the client request
 * @private
 */
Client.prototype._request = function (options, callback) {
  var self = this;
  var requestOptions = {};

  requestOptions.method = options.method || 'GET';
  requestOptions.headers = options.headers || {};
  requestOptions.path = options.path;
  requestOptions.strictSSL = typeof self.config.strictSSL === 'boolean'
    ? self.config.strictSSL : true;

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

    if (options.qs) {
      requestOptions.signingUrl += '?' + qs.stringify(options.qs);
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

    opts.uri = options.uri || self._getUrl(options);

    // Clean up our polluted options
    //
    // TODO refactor the options used in Before methods
    // to not require polluting request options
    //
    delete opts.path;
    delete opts.signingUrl;

    // Set our User Agent
    opts.headers['User-Agent'] = self.getUserAgent();

    // If we are missing callback
    if (!callback) {
      try {
        self.emit('log::trace', 'Sending (non-callback) client request', opts);
        return request(opts);
      } // if request throws still return an EE
      catch (exc1) {
        self.emit('log::trace', 'Unable to create (non-callback) request', opts);
        return errs.handle(exc1);
      }
    } else {
      try {
        self.emit('log::trace', 'Sending client request', opts);
        self.emit('log::debug', opts.method + ': ' + opts.uri);
        return request(opts, self._defaultRequestHandler(callback));
      } catch (exc2) {
        self.emit('log::error', 'Unable to create request', opts);
        return errs.handle(exc2, callback);
      }
    }
  }

  return sendRequest(requestOptions);
};

/**
 * Client._defaultRequestHandler
 *
 * @description handles requests for all calls
 *
 * @param callback
 * @returns {Function}
 * @private
 */
Client.prototype._defaultRequestHandler = function (callback) {

  var self = this;

  return function (err, res, body) {
    if (err) {
      return callback(err);
    }

    var err2 = self._parseError(res, body);

    if (err2) {
      self.emit('log::error', 'Error during provider response', err2);
      return callback(errs.create(err2));
    }

    self.emit('log::trace', 'Provider Response', {
      href: res.request.uri.href,
      method: res.request.method,
      headers: res.headers,
      statusCode: res.statusCode
    });

    callback(err, body, res);
  };
};

Client.prototype._parseError = function(response, body) {
  var self = this,
    statusCode = response.statusCode.toString(),
    err;

  if (Object.keys(self.failCodes).indexOf(statusCode) !== -1) {
    //
    // TODO: Support more than JSON errors here
    //
    err = {
      provider: self.provider,
      failCode: self.failCodes[statusCode],
      statusCode: response.statusCode,
      message: self.provider + ' Error (' +
        statusCode + '): ' + self.failCodes[statusCode],
      href: response.request.uri.href,
      method: response.request.method,
      headers: response.headers
    };

    if (body) {
      try {
        err.result = typeof body === 'string' ? JSON.parse(body) : body;
      } catch (e) {
        err.result = { err: body };
      }
    }
  }

  return err;
};
