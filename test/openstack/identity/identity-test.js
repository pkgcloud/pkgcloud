var identity = require('../../../lib/pkgcloud/openstack/identity'),
    vows = require('vows'),
    assert = require('assert'),
    nock = require('nock');

vows.describe('the pkgcloud openstack identity.createIdentity() function').addBatch({
  'with no options': {
    topic: function () {
      identity.createIdentity();
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'options is a required argument');
    }
  },
  'with only a callback': {
    topic: function () {
      identity.createIdentity(this.callback);
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'options is a required argument');
    }
  },
  'with incorrect types': {
    topic: function () {
      identity.createIdentity(true, true);
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'options is a required argument');
    }
  },
  'with options.identity of an invalid type': {
    topic: function () {
      identity.createIdentity({
        identity: true
      }, this.callback);
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'options.identity must be an Identity if provided');
    }
  },
  'with missing url': {
    topic: function () {
      identity.createIdentity({}, this.callback);
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'options.url is a required option');
    }
  },
  'with missing username and password': {
    topic: function () {
      identity.createIdentity({
        url: 'http://my.authendpoint.com'
      }, this.callback);
    },
    'should callback with an error': function (err, _) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to authorize; missing required inputs');
    }
  },
  'with missing password': {
    topic: function () {
      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME'
      }, this.callback);
    },
    'should callback with an error': function (err, _) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to authorize; missing required inputs');
    }
  },
  'with missing username': {
    topic: function () {
      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        password: 'asdf1234'
      }, this.callback);
    },
    'should callback with an error': function (err, _) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to authorize; missing required inputs');
    }
  },
  'with valid inputs': {
    topic: function () {

      nock('http://my.authendpoint.com')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken.json');

      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      }, this.callback);
    },
    'should return an identity': function (err, id) {
      assert.isNull(err);
      assert.instanceOf(id, identity.Identity);
    }
  },
  'with incorrect region': {
    topic: function () {

      nock('http://my.authendpoint.com')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken.json');

      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'foo'
      }, this.callback);
    },
    'should fail to match region in catalog': function (err, id) {
      assert.isUndefined(id);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to identify target endpoint for Service: volume');
    }
  },
  'with no region and regionless service catalog': {
    topic: function () {

      nock('http://my.authendpoint.com')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken-noRegion.json');

      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, this.callback);
    },
    'should return an identity': function (err, id) {
      assert.isNull(err);
      assert.instanceOf(id, identity.Identity);
    }
  },
  'with no tenants listed from /v2.0/tenants': {
    topic: function () {

      nock('http://my.authendpoint.com')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/no-tenants.json');

      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, this.callback);
    },
    'should return an error': function (err, _) {
      assert.isUndefined(_);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to find tenants');
    }
  },
  'with no active tenants listed from /v2.0/tenants': {
    topic: function () {

      nock('http://my.authendpoint.com')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'asdf1234'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/no-activeTenants.json');

      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, this.callback);
    },
    'should return an error': function (err, _) {
      assert.isUndefined(_);
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'Unable to find an active tenant');
    }
  }
}).export(module);
