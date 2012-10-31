/*
 * databases-redis-test.js: Tests for IrisCouch Redis database service
 *
 * (C) 2012 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows    = require('vows'),
    helpers = require('../../helpers'),
    assert  = require('../../helpers/assert'),
    nock    = require('nock');

var client = helpers.createClient('iriscouch', 'database'),
    testContext = {};

if (process.env.NOCK) {
  nock('https://hosting.iriscouch.com:443')
    .post('/hosting_public', helpers.loadFixture('iriscouch/database-redis.json'))
  .reply(201,
    "{\"ok\":true,\"id\":\"Redis/nodejitsudb43639\",\"rev\":\"1-63cf360ebc115cdc8a709a910fdef6d7\"}\n");
}

vows.describe('pkgcloud/iriscouch/databases-redis').addBatch({
  "The pkgcloud IrisCouch client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          var subdomain = ((process.env.NOCK) ? 'nodejitsudb43639' : 'nodejitsudb' + Math.floor(Math.random()*100000));
          testContext.tempPassword = ((process.env.NOCK) ? 'sTTi:lh9vCF[' : randomPassword(12).replace("\\", ""));
          client.create({
            subdomain: subdomain,
            first_name: "Marak",
            last_name: "Squires",
            email: "marak.squires@gmail.com",
            // For redis instead of couch just put type to redis
            type: "redis",
            password: testContext.tempPassword
          }, this.callback);
        },
        "should respond correctly": function (err, database) {
          assert.isNull(err);
          assert.ok(database.id);
          assert.ok(database.uri);
          testContext.databaseId = database.id;
          assert.equal(database.password, [database.host, testContext.tempPassword].join(':'));
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
          "should respond with errors": assert.assertError,
        },
        "no email": {
          topic: function () {
            client.create({ subdomain:'testDatabase', first_name: "Daniel", last_name: "Aristizabal"}, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no subdomain": {
          topic: function () {
            client.create({ email: "daniel@nodejitsu.com", first_name: "Daniel", last_name: "Aristizabal"}, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no names": {
          topic: function () {
            client.create({ email: "daniel@nodejitsu.com", subdomain:'testDatabase'}, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).export(module);

//
// Just a quick and lazy random password generator
//
function randomPassword (length) {
  if (length == 1) {
    return String.fromCharCode(Math.floor(Math.random() * (122 - 48 + 1)) + 48);
  }
  return String.fromCharCode(Math.floor(Math.random() * (122 - 48 + 1)) + 48) + randomPassword(length - 1);
}