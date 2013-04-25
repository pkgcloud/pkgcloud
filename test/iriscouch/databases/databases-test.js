///*
// * databases-test.js: Tests for IrisCouch databases service
// *
// * (C) 2012 Nodejitsu Inc.
// * MIT LICENSE
// *
// */
//
//var vows    = require('vows'),
//    helpers = require('../../helpers'),
//    assert  = require('../../helpers/assert'),
//    nock    = require('nock');
//
//var client = helpers.createClient('iriscouch', 'database'),
//    testContext = {};
//
//if (process.env.NOCK) {
//  nock('https://hosting.iriscouch.com:443')
//    .post('/hosting_public', helpers.loadFixture('iriscouch/database.json'))
//      .reply(201,
//        "{\"ok\":true,\"id\":\"Server/nodejitsudb908\",\"rev\":\"1-dc91e4ee524420e6f32607b0c24151de\"}\n");
//
//  nock('http://nodejitsudb908.iriscouch.com')
//    .get('/')
//      .reply(404, "Host not found: nodejitsudb908.iriscouch.com")
//    .get('/')
//      .reply(404, "Host not found: nodejitsudb908.iriscouch.com")
//    .get('/')
//      .reply(200, "{\"couchdb\":\"Welcome\",\"version\":\"1.2.0\"}\n");
//}
//
//vows.describe('pkgcloud/iriscouch/databases').addBatch({
//  "The pkgcloud IrisCouch client": {
//    "the create() method": {
//      "with correct options": {
//        topic: function () {
//          var subdomain = ((process.env.NOCK) ? 'nodejitsudb908' : 'nodejitsudb' + Math.floor(Math.random()*100000));
//          client.create({
//            subdomain: subdomain,
//            first_name: "Marak",
//            last_name: "Squires",
//            email: "marak.squires@gmail.com"
//          }, this.callback);
//        },
//        "should respond correctly": function (err, database) {
//          assert.isNull(err);
//          assert.ok(database.id);
//          assert.ok(database.uri);
//          testContext.databaseId = database.id;
//        }
//      },
//      "with invalid options like": {
//        "no options": {
//          topic: function () {
//            client.create(this.callback);
//          },
//          "should respond with errors": assert.assertError
//        },
//        "invalid options": {
//          topic: function () {
//            client.create({ invalid:'keys' }, this.callback);
//          },
//          "should respond with errors": assert.assertError,
//        },
//        "no email": {
//          topic: function () {
//            client.create({ subdomain:'testDatabase', first_name: "Daniel", last_name: "Aristizabal"}, this.callback);
//          },
//          "should respond with errors": assert.assertError
//        },
//        "no subdomain": {
//          topic: function () {
//            client.create({ email: "daniel@nodejitsu.com", first_name: "Daniel", last_name: "Aristizabal"}, this.callback);
//          },
//          "should respond with errors": assert.assertError
//        },
//        "no names": {
//          topic: function () {
//            client.create({ email: "daniel@nodejitsu.com", subdomain:'testDatabase'}, this.callback);
//          },
//          "should respond with errors": assert.assertError
//        }
//      }
//    }
//  }
//}).export(module);
