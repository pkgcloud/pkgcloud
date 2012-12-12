/*
 * databases-test.js: Tests for azure tables databases service
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var vows    = require('vows'),
    helpers = require('../../helpers'),
    assert  = require('../../helpers/assert'),
    nock    = require('nock');

var client = helpers.createClient('azure', 'database'),
    testContext = {};

if (process.env.NOCK) {
  nock('http://test-storage-account.table.core.windows.net')
    .filteringRequestBody(/.*/, '*')
    .post('/Tables', '*')
    .reply(201, helpers.loadFixture('azure/database/createTableResponse.xml'))
    .get('/Tables')
    .reply(201, helpers.loadFixture('azure/database/listTables.xml'))
    .delete("/Tables%28%27testDatabase%27%29")
    .reply(204, "", {'content-length': '0'});
}

vows.describe('pkgcloud/azure/databases').addBatch({
  "The pkgcloud azure client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          client.create({
            name: 'testDatabase'
          }, this.callback);
        },
        "should respond correctly": function (err, database) {
          assert.isNull(err);
          assert.ok(database.id);
          assert.ok(database.uri);
          assert.equal(database.username, '');
          assert.equal(database.password, '');
          testContext.databaseId = database.id;
        }
      },
      "with invalid options like": {
        "no options": {
          topic: function () {
            client.create(this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "invalid options": {
          topic: function () {
            client.create({ invalid:'keys' }, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud azure client": {
    "the list() method": {
      "with correct options": {
        topic: function () {
          client.list(this.callback);
        },
        "should respond correctly": function (err, result) {
          assert.isNull(err);
          assert.isArray(result);
          assert.ok(result.length > 0);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud azure client": {
    "the remove() method": {
      "with correct options": {
        topic: function () {
          client.remove(testContext.databaseId, this.callback);
        },
        "should respond correctly": function (err, result) {
          assert.isNull(err);
          assert.equal(result, true);
        }
      },
      "without options": {
        topic: function () {
          client.remove(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).export(module);
