/*
 * instances-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/databases/instances').addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstances() method": {
      topic: function() {
        client.getInstances(this.callback);
      },
      "should return the list of instances": function (err, instances) {
        assert.isNull(err);
        console.log(instances);
        assert.isTrue(false);
      }
    }
  } 
}).export(module);
