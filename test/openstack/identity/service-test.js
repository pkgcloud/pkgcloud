var identity = require('../../../lib/pkgcloud/openstack/identity'),
  vows = require('vows'),
  assert = require('assert'),
  nock = require('nock');

vows.describe('pkgcloud openstack identity Service class').addBatch({
  'with no options': {
    topic: function () {
      return new identity.Service();
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'details are a required argument');
    }
  },
  'with no details': {
    topic: function () {
      return new identity.Service('ORD');
    },
    'should throw an error': function (topic) {
      assert.instanceOf(topic, Error);
      assert.equal(topic.message, 'details are a required argument');
    }
  },
  'with valid options': {
    topic: function () {
      return new identity.Service('', {
        "endpoints": [
          {
            "adminURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "internalURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "publicURL": "http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041"
          }
        ],
        "endpoints_links": [],
        "type": "volume",
        "name": "volume"
      });
    },
    'should return a service': function (service) {
      assert.instanceOf(service, identity.Service);
    }
  },
  'with valid options, getEndpointUrl': {
    topic: function () {
      var service = new identity.Service('', {
        "endpoints": [
          {
            "adminURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "internalURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "publicURL": "http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041"
          }
        ],
        "endpoints_links": [],
        "type": "volume",
        "name": "volume"
      });

      return service.getEndpointUrl();
    },
    'should return endpoint url': function (url) {
      assert.equal(url, "http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041");
    }
  }
}).export(module);
