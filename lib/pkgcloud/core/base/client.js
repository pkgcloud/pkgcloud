/*
 * client.js: Base client from which all pkgcloud clients inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var events = require('eventemitter2'),
    request = require('request'),
    utile = require('utile'),
    common = require('../../common');

var Client = exports.Client = function (options) {
  events.EventEmitter2.call(this, { delimiter: '::', wildcard: true });
  this.config = options || {};
};

utile.inherits(Client, events.EventEmitter2);

Client.prototype.request = function () {
  var self = this,
      callback,
      response,
      errback,
      options,
      method;
  
  if (arguments.length === 3) {
    errback = arguments[1];
    callback = arguments[2];
    options = typeof arguments[0] === 'object' ? arguments[0] : {
      method: 'GET',
      path: arguments[0]
    }
  }
  else if (arguments.length === 4) {
    errback = arguments[2];
    callback = arguments[3];
    options = {
      method: arguments[0],
      path: arguments[1]
    }
  }
  
  function sendRequest () {
    //
    // Setup any specific request options before 
    // making the request
    //
    if (self.before) {
      self.before.forEach(function (fn) {
        options = fn.call(self, options) || options;
      });
    }

    //
    // Set the url for the request based
    // on the `path` supplied.
    //
    if (typeof options.path === 'string') {
      options.path = [options.path];
    }
    
    options.uri = self.url.apply(self, options.path);
    return request(options, function (err, res, body) {
      if (err) {
        return errback(err);
      }

      var statusCode = res.statusCode.toString(),
          err;

      if (Object.keys(self.failCodes).indexOf(statusCode) !== -1) {
        //
        // TODO: Support more than JSON errors here
        //
        err = new Error(
          self.provider +
          ' Error (' + statusCode + '): ' +
          self.failCodes[statusCode]
        );
        err.result = JSON.parse(body);
        return errback(err);
      }

      callback(body, res);
    });
  }
  if (!this.authorized) {
    this.auth(function (err) {
      //
      // TODO: Pipe response from `sendRequest` to 
      // new EventEmitter returned here.
      //
      sendRequest();
    });
    
    return new events.EventEmitter2();
  } 
  
  return sendRequest();
}
