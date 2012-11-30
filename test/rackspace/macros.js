/*
 * macros.js: Tests macros for Rackspace
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    filed = require('filed'),
    assert = require('../helpers/assert'),
    helpers = require('../helpers');

exports.shouldHaveCreds = function (client) {
  return function () {
    assert.isObject(client.config);
    assert.include(client.config, 'username');
    assert.include(client.config, 'apiKey');

    assert.isFunction(client.auth);
  } 
};

exports.shouldAuthenticate = function (client) {
  return {
    topic: function () {
      client.auth(this.callback);
    },
    "should respond with 204 and appropriate headers": function (err, res) {
      assert.equal(res.statusCode, 204);
      assert.isObject(res.headers);
      assert.include(res.headers, 'x-server-management-url');
      assert.include(res.headers, 'x-storage-url');
      assert.include(res.headers, 'x-cdn-management-url');
      assert.include(res.headers, 'x-auth-token');
    },
    "should update the config with appropriate urls": function (err, res) {
      var config = client.config;
      assert.equal(res.headers['x-server-management-url'], config.serverUrl);
      assert.equal(res.headers['x-storage-url'], config.storageUrl);
      assert.equal(res.headers['x-cdn-management-url'], config.cdnUrl);
      assert.equal(res.headers['x-auth-token'], config.authToken);
    }
  };
}

exports.shouldNotAuthenticate = function (service) {
  return {
    topic: function () {
      var badClient = helpers.createClient('rackspace', service, {
        "auth": {
          "username": "fake",
          "apiKey": "data"
        }
      });

      badClient.auth(this.callback);
    },
    "should respond with 401": function (err, res) {
      assert.equal(res.statusCode, 401);
    }
  }
};

exports.shouldCreateContainer = function (client, name, message) {
  message = message || "when creating a container";
  
  var context = {};
  context[message] = {
    topic: function () {
      client.createContainer(name, this.callback);
    },
    "should return a valid container": function (err, container) {
      assert.isNull(err);
      assert.assertContainer(container);
    }
  };
  
  return {
    "The pkgcloud Rackspace storage client": {
      "the createContainer() method": context
    }
  };
};

exports.shouldDestroyContainer = function (client, name) {
  return {
    "The pkgcloud Rackspace storage client": {
      "the destroyContainer() method": {
        topic: function () {
          client.destroyContainer(name, this.callback)
        },
        "should return true": function (err, success) {
          assert.isTrue(success);
        }
      }
    }
  };
};

exports.upload = {};

exports.upload.fullpath = function (client, options) {
  return {
    topic: function () {
      client.upload(options, function () { })
        .on('end', this.callback);
    },
    "should raise the `end` event": function () {
      assert.isTrue(true);
    }
  }
};

exports.upload.stream = function (client, container, local, remote) {
  return {
    topic: function () {
      client.upload({
        container: container,
        remote: remote,
        stream: fs.createReadStream(local),
        headers: { 
          'content-length': fs.statSync(local).size 
        }
      }, function () { }).on('end', this.callback);
    },
    "should raise the `end` event": function () {
      assert.isTrue(true);
    }
  }
};

exports.upload.piped = function (client, container, local, remote) {
  return {
    topic: function () {
      var ustream = client.upload({
        container: container,
        remote: remote
      }, function () { });

      filed(local).pipe(ustream);
      ustream.on('end', this.callback)
    },
    "should raise the `end` event": function () {
      assert.isTrue(true);
    }
  }
};
