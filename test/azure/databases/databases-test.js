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
  nock('https://providers.azure.com')
    .post('/provider/resources', "app_id=testDatabase&plan=free")
      .reply(200, helpers.loadFixture('azure/database.json'))

    .delete('/provider/resources/63562')
      .reply(200, "OK");
}

vows.describe('pkgcloud/azure/databases').addBatch({
  "The pkgcloud azure client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          client.create({
            name: 'food6'
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
