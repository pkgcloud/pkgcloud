var identity = require('../../../lib/pkgcloud/openstack/identity'),
    should = require('should');

describe('pkgcloud openstack identity Service Class', function() {

  it('with no options should throw an error', function() {
    (function() {
      var x = new identity.Service();
    }).should.throw('details are a required argument');
  });

  it('with no details should throw an error', function () {
    (function () {
      var x = new identity.Service('ORD');
    }).should.throw('details are a required argument');
  });

  it('with valid options should return a service', function () {
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

    service.should.be.instanceOf(identity.Service);
  });

  it('with valid options getEndpointUrl should return a endpoint URL', function () {
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

    service.getEndpointUrl().should.equal('http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });

  it('with valid options getEndpointUrl with invalid region should throw', function () {
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

    (function() {
      service.getEndpointUrl({ region: 'ORD' })
    }).should.throw('Unable to identity endpoint url');
  });

  it('with valid options getEndpointUrl with valid region return correctly', function () {
    var service = new identity.Service('', {
        "endpoints": [
          {
            "adminURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "internalURL": "http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "publicURL": "http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041"
          },
          {
            "adminURL": "http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "internalURL": "http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "publicURL": "http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "region":"ORD"
          }
        ],
        "endpoints_links": [],
        "type": "volume",
        "name": "volume"
      });

    service.getEndpointUrl({ region: 'ORD' })
      .should.equal('http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });

  it('with valid options getEndpointUrl without region when region is available return correctly', function () {
    var service = new identity.Service('', {
        "endpoints": [
          {
            "adminURL": "http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "internalURL": "http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "publicURL": "http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041",
            "region": "ORD"
          },
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

    service.getEndpointUrl().should.equal('http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });

  it('with null service validateRegionForService should return an error', function(done) {
    identity.service.validateRegionForService(null, '', function(err, result) {
      should.exist(err);
      should.not.exist(result);
      err.message.should.equal('service is a required argument');
      done();
    });
  });
});


//  'with null service validateRegionForService': {
//    topic: function () {
//      identity.service.validateRegionForService(null, '', this.callback);
//    },
//    'should return an error': function (err, _) {
//      assert.isUndefined(_);
//      assert.instanceOf(err, Error);
//      assert.equal(err.message, 'service is a required argument');
//    }
//  }
//}).export(module);
