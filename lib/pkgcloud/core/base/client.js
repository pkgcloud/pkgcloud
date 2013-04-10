/*
 * client.js: Base client from which all pkgcloud clients inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    events = require('eventemitter2'),
    request = require('request'),
    utile = require('utile'),
    qs = require('querystring'),
    common = require('../../common'),
    errs = require('errs');

var Client = exports.Client = function (options) {
  events.EventEmitter2.call(this, { delimiter: '::', wildcard: true });
  this.config = options || {};
};

utile.inherits(Client, events.EventEmitter2);

Client.prototype.request = function () {
  var requestPayload = {
      options: {}
    };

  if (arguments.length === 3) {
    requestPayload.errback = arguments[1];
    requestPayload.callback = arguments[2];
    requestPayload.options = typeof arguments[0] === 'object' ? arguments[0] : {
      method: 'GET',
      path: arguments[0],
      headers: {}
    };
  }
  else if (arguments.length === 4) {
    requestPayload.errback = arguments[2];
    requestPayload.callback = arguments[3];
    requestPayload.options = {
      method: arguments[0],
      path: arguments[1],
      headers: {}
    };
  }
  else if (arguments.length === 5) {
    var encoded = qs.encode(arguments[2]);
    requestPayload.errback = arguments[3];
    requestPayload.callback = arguments[4];
    requestPayload.options = {
      method: arguments[0],
      path: arguments[1] + (encoded ? '?' + encoded : ''),
      headers: {}
    };
  }

  if (!requestPayload.options.path && !requestPayload.options.url) {
    return errs.handle(
      errs.create({ message: 'No path was provided' }),
      requestPayload.errback
    );
  }

  return this._doRequest(requestPayload);
};

Client.prototype._doRequest = function(payload) {

  var self = this;

  return sendRequest();

  function sendRequest() {
    //
    // Setup any specific request options before
    // making the request
    //
    if (self.before) {
      var errors = false;
      for (var i = 0; i < self.before.length; i++) {
        var fn = self.before[i];
        try {
          payload.options = fn.call(self, payload.options) || payload.options;
          // on errors do error handling, break.
        } catch (exc) {
          errs.handle(exc, payload.errback);
          errors = true;
          break;
        }
      }
      if (errors) {
        return;
      }
    }

    //
    // Set the url for the request based
    // on the `path` supplied.
    //
    if (typeof payload.options.path === 'string') {
      payload.options.path = [payload.options.path];
    }

    //
    // Allow override of URL on parameters, otherwise use the function
    //
    if (!payload.options.url) {
      payload.options.url = self.url.apply(self, payload.options.path);
    }

    // don't delete the delete. this options path thing was messing
    // request up.
    delete payload.options.path;

    if (!payload.errback || !payload.callback) {
      try {
        return request(payload.options);
      } // if request throws still return an EE
      catch (exc1) {
        return errs.handle(exc1);
      }
    } else {
      try {
        return request(payload.options, handleRequest);
      } catch (exc2) {
        return errs.handle(exc2, payload.errback);
      }
    }
  }

  function handleRequest(err, res, body) {
    if (err) {
      return payload.errback(err);
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
        err2.result = {err: body};
      }
      return payload.errback(errs.create(err2));
    }
    payload.callback(body, res);
  }
}
