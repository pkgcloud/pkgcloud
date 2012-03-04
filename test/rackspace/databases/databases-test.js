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

vows.describe('pkgcloud/rackspace/databases/databases').addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabases() method": {
      topic: function () {
        var self = this;
        client.getInstances(function (err, instances) {
          var ready = instances.filter(function (instance) {
            return (instance.status == 'ACTIVE');
          });
          if (ready.length === 0) {
            console.log('ERROR:   Is necessary have Instances actived for test the create of database');
          }
          client.createDatabase({name: 'TestDatabase', instance:ready[0]}, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabase() method with no name": {
      topic: function () {
        client.createDatabase({}, this.callback);
      },
      "should get error for name": function (err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabase() method with no instance": {
      topic: function () {
        client.createDatabase({name:'NotCreated'}, this.callback);
      },
      "should get error for instance": function (err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getDatabases() method": {
      topic: function () {
        var self = this;
        client.getInstances(function (err, instances) {
          var ready = instances.filter(function (instance) {
            return (instance.status == 'ACTIVE');
          });
          if (ready.length === 0) {
            console.log('ERROR:   Is necessary have Instances actived for test the create of database');
          }
          client.getDatabases(ready[0], self.callback);
        });
      },
      "should return a list of databases": function (err, list, response) {
        assert.isNull(err);
        assert.isArray(list);
        assert.ok(list.length > 0);
        assert.equal(response.statusCode, 200);
      },
      "the list should have names": function (err, list, response) {
        assert.ok(list[0]);
        assert.ok(list[0].name);
        assert.isString(list[0].name);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyDatabase() method": {
      topic: function () {
        var self = this;
        client.getInstances(function (err, instances) {
          var ready = instances.filter(function (instance) {
            return (instance.status == 'ACTIVE');
          });
          if (ready.length === 0) {
            console.log('ERROR:   Is necessary have Instances actived for test the create of database');
          }
          client.destroyDatabase('TestDatabase', ready[0], self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).export(module);
