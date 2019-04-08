/*
 * macros.js: Tests macros for Rackspace
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var fs = require('fs'),
    filed = require('filed-mimefix'),
    assert = require('../helpers/assert');

exports.shouldHaveCreds = function (client) {
  return function () {
    assert.isObject(client.config);
    assert.include(client.config, 'username');
    assert.include(client.config, 'apiKey');

    assert.isFunction(client.auth);
  };
};

exports.shouldCreateContainer = function (client, name, message) {
  message = message || 'when creating a container';

  var context = {};
  context[message] = {
    topic: function () {
      client.createContainer(name, this.callback);
    },
    'should return a valid container': function (err, container) {
      assert.isNull(err);
      assert.assertContainer(container);
    }
  };

  return {
    'The pkgcloud Rackspace storage client': {
      'the createContainer() method': context
    }
  };
};

exports.shouldDestroyContainer = function (client, name) {
  return {
    'The pkgcloud Rackspace storage client': {
      'the destroyContainer() method': {
        topic: function () {
          client.destroyContainer(name, this.callback);
        },
        'should return true': function (err, success) {
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
    'should raise the `end` event': function () {
      assert.isTrue(true);
    }
  };
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
    'should raise the `end` event': function () {
      assert.isTrue(true);
    }
  };
};

exports.upload.piped = function (client, container, local, remote) {
  return {
    topic: function () {
      var ustream = client.upload({
        container: container,
        remote: remote
      }, function () { });

      filed(local).pipe(ustream);
      ustream.on('end', this.callback);
    },
    'should raise the `end` event': function () {
      assert.isTrue(true);
    }
  };
};
