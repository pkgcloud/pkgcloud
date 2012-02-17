// if one of the befores blows up should return in err back
// if one of the befores blows up no callback returns in stream
// should be able to sign appropriately
/*
 * client.js: Tests for pkgcloud Joyent compute image requests
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var vows   = require('vows'),
    assert = require('../../helpers/assert'),
    Client = new require('../../../lib/pkgcloud/core/base/client').Client;

vows.describe('pkgcloud/core/base/client').addBatch({
  "The pkgcloud base client": {
    "the request() method": {
      "with a wrong request with a cb": {
        topic: function () {
          var cli = new Client();
          cli.url = function () { return "badurl"; };
          cli.failCodes = {};
          cli.request('/', this.callback, this.callback);
        },
        "should return the error on the cb": function (err, response) {
          assert.ok(err.message);
        }
      },
      "with a wrong request without a cb": {
        topic: function () {
          var self = this,
              cli = new Client();
              
          cli.url = function () { return "badurl"; };
          cli.failCodes = {};
          var stream = cli.request('/');
          stream.on('error', function () { return self.callback(null, true); });
          stream.on('end', function () { return self.callback(null, false); });
        },
        "should return the error on the EE": function (_, ok) {
          assert.ok(ok);
        }
      }
    },
    "the before filters": {
      "throwing an error with a cb": {
        topic: function () {
          var cli = new Client();
          cli.url = function () { return "badurl"; };
          cli.failCodes = {};
          cli.before = [function () { throw new Error('Foo!'); }];
          cli.request('/', this.callback, this.callback);
        },
        "should return the error on the cb": function (err, response) {
          assert.ok(err.message);
          assert.equal(err.message, "Foo!");
        }
      },
      "throwing an error without a cb": {
        topic: function () {
          var self = this,
              cli = new Client();
              
          cli.url = function () { return "badurl"; };
          cli.failCodes = {};
          var stream = cli.request('/');
          stream.on('error', function () { return self.callback(null, true); });
          stream.on('end', function () { return self.callback(null, false); });
        },
        "should return the error on the EE": function (_, ok) {
          assert.ok(ok);
        }
      }
    }
  }
})["export"](module);
