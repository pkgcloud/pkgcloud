var context = require('../../../lib/pkgcloud/openstack/context');

describe('pkgcloud openstack context Service Class', function() {

  it('with no options should throw an error', function() {
    (function() {
      new context.Service();
    }).should.throw('details are a required argument');
  });

  it('with no details should throw an error', function () {
    (function () {
      new context.Service('ORD');
    }).should.throw('details are a required argument');
  });

  it('with valid options should return a service', function () {
    var service = new context.Service({
        endpoints: [
          {
            adminURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            internalURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            publicURL: 'http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041'
          }
        ],
        endpoints_links: [],
        type: 'volume',
        name: 'volume'
      });

    service.should.be.instanceOf(context.Service);
  });

  it('with valid options getEndpointUrl should return a endpoint URL', function () {
    var service = new context.Service({
      endpoints: [
        {
          adminURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
          internalURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
          publicURL: 'http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041'
        }
      ],
      endpoints_links: [],
      type: 'volume',
      name: 'volume'
    });

    service.getEndpointUrl().should.equal('http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });

  it('with valid options getEndpointUrl with invalid region should throw', function () {
    var service = new context.Service({
      endpoints: [
        {
          adminURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
          internalURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
          publicURL: 'http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041'
        }
      ],
      endpoints_links: [],
      type: 'volume',
      name: 'volume'
    });

    (function() {
      service.getEndpointUrl({
        region: 'ORD' });
    }).should.throw('Unable to identify endpoint url');
  });

  it('with valid options getEndpointUrl with valid region return correctly', function () {
    var service = new context.Service({
        endpoints: [
          {
            adminURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            internalURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            publicURL: 'http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041'
          },
          {
            adminURL: 'http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041',
            internalURL: 'http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041',
            publicURL: 'http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041',
            region:'ORD'
          }
        ],
        endpoints_links: [],
        type: 'volume',
        name: 'volume'
      });

    service.getEndpointUrl({ region: 'ORD' })
      .should.equal('http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });

  it('with valid options getEndpointUrl without region when region is available return correctly', function () {
    var service = new context.Service({
        endpoints: [
          {
            adminURL: 'http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041',
            internalURL: 'http://10.225.0.9:8776/v1/72e90ecb69c44d0296072ea39e537041',
            publicURL: 'http://volume2.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041',
            region: 'ORD'
          },
          {
            adminURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            internalURL: 'http://10.225.0.8:8776/v1/72e90ecb69c44d0296072ea39e537041',
            publicURL: 'http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041'
          }

        ],
        endpoints_links: [],
        type: 'volume',
        name: 'volume'
      });

    service.getEndpointUrl().should.equal('http://volume.myownendpoint.org:8776/v1/72e90ecb69c44d0296072ea39e537041');
  });
});

