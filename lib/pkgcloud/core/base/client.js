/*
 * client.js: Base client from which all pkgcloud clients inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    events = require('eventemitter2'),
    morestreams = require('morestreams'),
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
  var self = this,
      responded,
      callback,
      errback,
      options = {},
      buffer,
      method,
      piped,
      ended, 
      dest;

  if (arguments.length === 3) {
    errback = arguments[1];
    callback = arguments[2];
    options = typeof arguments[0] === 'object' ? arguments[0] : {
      method: 'GET',
      path: arguments[0],
      headers: {}
    };
  }
  else if (arguments.length === 4) {
    errback = arguments[2];
    callback = arguments[3];
    options = {
      method: arguments[0],
      path: arguments[1],
      headers: {}
    };
  }
  else if (arguments.length === 5) {
    var encoded = qs.encode(arguments[2]);
    errback = arguments[3];
    callback = arguments[4];
    options = {
      method: arguments[0],
      path: arguments[1] + (encoded ? '?' + encoded : ''),
      headers: {}
    };
  }

  if (!options.path && !options.url) {
    return errs.handle(
      errs.create({ message: 'No path was provided' }), 
      errback
    );
  }

  function handleRequest(err, res, body) {
    if (err) {
      return errback(err);
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
      } catch (e) { err2.result = {err: body}; }
      return errback(errs.create(err2));
    }
    callback(body, res);
  }

  function sendRequest () {
    //
    // Setup any specific request options before 
    // making the request
    //
    if (self.before) {
      var errors = false;
      for (var i in self.before) {
        var fn = self.before[i];
        try {
          options = fn.call(self, options) || options;
        // on errors do error handling, break.
        } catch (exc) { errs.handle(exc, errback); errors = true; break; }
      }
      if (errors) { return; }
    }

    //
    // Set the url for the request based
    // on the `path` supplied.
    //
    if (typeof options.path === 'string') {
      options.path = [options.path];
    }

    //
    // Allow override of URL on parameters, otherwise use the function
    //
    if (!options.url) {
      options.url = self.url.apply(self, options.path);
    }

    // dont delete the delete. this options path thing was messing
    // request up.
    delete options.path;

    if (!errback || !callback) {
      try {
        return request(options);
      } // if request throws still return an EE
      catch (exc1) { return errs.handle(exc1); }
    } else {
      try {
        return request(options, handleRequest);
      } catch (exc2) { return errs.handle(exc2, errback); }
    }
  }
  
  //
  // Helper function which sets the appropriate headers
  // for Rackspace Cloudfiles depending on the state of the 
  // buffer.
  //
  // TODO: Refactor this into the Rackspace Cloudfiles client.
  //
  function onPiped() {
    options.headers = options.headers || {};
    
    if (ended) {
      options.headers['content-length'] = buffer.size;
    }
    else {
      // this was crashing all getServer Tests
      //options.headers['transfer-encoding'] = 'chunked';
      // from teh docs
      // The Cloud Server API does not support chunked transfer-encoding.
    }
  }
  
  //
  // Helper function which creates a `BufferedStream` to hold
  // any piped data while this instance is authenticating.
  //
  function createBuffer() {
    buffer = new morestreams.BufferedStream();

    buffer.emit = function (event) {
      if (event === 'end' && !responded) {
        ended = true;
        return;
      }
      
      morestreams.BufferedStream.prototype.emit.apply(buffer, arguments);
    };
    
    buffer.pipe = function (target) {
      piped = true;
      dest = target;
      morestreams.BufferedStream.prototype.pipe.apply(buffer, arguments);
    };

    buffer.on('pipe', function () {
      piped = true;
    });
  }
  
  function pipeUpload(response) {
    if (piped) {
      buffer.pipe(response);
    }
    else {
      buffer.on('pipe', function () {
        buffer.pipe(response);
      });
    }
  }
  
  function pipeDownload(response) {
    if (piped) {
      response.pipe(dest);
    }
    else {
      //
      // Remark: Do we need to do something here?
      //
    }
  }
  
  
  if (!this.authorized && (this.provider === 'rackspace' || this.provider == 'openstack')) {
    //
    // If this instance is not yet authorized, then return
    // a `BufferedStream` which can be piped to in the current
    // tick.
    //
    createBuffer();
    this.auth(function (err) {
      onPiped();
      var response = sendRequest();
      
      response.on('end', function () {
        responded = true;
        buffer.emit('end');
        buffer.removeAllListeners('pipe');
      });

      response.on('response', function (res) {
        buffer.emit('response', res);
      });
            
      if (options.upload) {
        pipeUpload(response);
      }
      else if (options.download) {
        pipeDownload(response);
      }
    });
    
    return buffer;
  } 
  
  return sendRequest();
};
