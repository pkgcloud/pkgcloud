/*
 * base-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
  path = require('path'),
  should = require('should'),
  utile = require('utile'),
  helpers = require('../../helpers'),
  nock = require('nock'),
  async = require('async'),
  _ = require('underscore'),
  providers = require('../../configs/providers.json'),
  versions = require('../../fixtures/versions.json'),
  Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
  Image = require('../../../lib/pkgcloud/core/compute/image').Image,
  Server = require('../../../lib/pkgcloud/core/compute/server').Server,
  azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi'),
  mock = !!process.env.NOCK;

var azureOptions = require('../../fixtures/azure/azure-options.json');

azureApi._updateMinimumPollInterval(mock ? 10 : azureApi.MINIMUM_POLL_INTERVAL);

module.exports = {
  getVersion: {
    test: function (provider, client, context) {
      return function (done) {
        var mocks;

        if (mock) {
          mocks = setupVersionMock(client, provider);
        }

        client.getVersion(function (err, version) {
          should.not.exist(err);
          should.exist(version);
          version.should.equal(versions[provider]);

          mocks && mocks.forEach(function (m) {
            m.done();
          });
          done();
        });
      }
    },
    description: 'the getVersion() method with no arguments should return the version'
  },
  getFlavors: {
    test: function (provider, client, context) {
      return function (done) {
        var m = process.env.NOCK ? 1 : 100,
          mocks;

        if (mock) {
          mocks = setupFlavorMock(client, provider);
        }

        client.getFlavors(function (err, flavors) {
          should.not.exist(err);
          should.exist(flavors);

          flavors.forEach(function (flavor) {
            flavor.should.be.instanceOf(Flavor);
          });

          context.flavors = flavors;

          done();
        });
      }
    },
    description: 'the getFlavors() should return a list of flavors'
  },
  getImages: {
    test: function (provider, client, context) {
      return function (done) {
        var mocks;

        if (mock) {
          mocks = setupImagesMock(client, provider);
        }

        client.getImages(function (err, images) {
          should.not.exist(err);
          should.exist(images);

          images.forEach(function (image) {
            image.should.be.instanceOf(Image);
          });

          context.images = images;
          mocks.forEach(function (m) {
            m.done();
          });
          done();
        });
      }
    },
    description: 'the getImages() method should return a list of images'
  },
  createServer: {
    test: function (provider, client, context) {
      return function (done) {
        var mocks,
            m = mock ? 0.1 : 100;

        if (mock) {
          mocks = setupServerMock(client, provider);
        }

        client.createServer(utile.mixin({
          name: 'create-test-setWait',
          image: context.images[0].id,
          flavor: context.flavors[0].id
        }, provider === 'azure' ? azureOptions : {}), function (err, server) {
          should.not.exist(err);
          should.exist(server);

          server.setWait({ status: 'RUNNING' }, 100 * m, function (err, srv) {
            should.not.exist(err);
            should.exist(srv);
            srv.should.be.instanceOf(Server);
            srv.name.should.equal('create-test-setWait');
            srv.status.should.equal('RUNNING');
            context.server = srv;
            mocks.forEach(function (m) {
              m.done();
            });
            done();
          });
        });
      }
    },
    description: 'the setWait() method waiting for a server to be operational should return a running server'
  },
  destroyServer: {
    test: function (provider, client, context) {
      return function (done) {
        var mocks;

        // TODO enable destroy tests for all providers
        if (provider === 'joyent' || provider === 'amazon' || provider === 'azure') {
          done();
          return;
        }

        if (mock) {
          mocks = setupDestroyMock(client, provider);
        }

        client.destroyServer(context.server, function(err, result) {
          should.not.exist(err);
          should.exist(result);

          mocks.forEach(function (m) {
            m.done();
          });

          done();
        });
      }
    },
    description: 'the destroyServer() method should remove the server correctly'
  }
};

function setupVersionMock(client, provider) {
  var a, b;

  if (provider === 'rackspace') {
    a = nock('https://' + client.serversUrl)
      .get('/')
      .reply(200,
      { versions: [
        { id: 'v1.0', status: 'BETA'}
      ]});
  }
  else if (provider === 'openstack') {
    a = nock(client.authUrl)
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          }
        }
      })
      .reply(200, helpers.loadFixture('openstack/initialToken.json'))
      .get('/v2.0/tenants')
      .reply(200, helpers.loadFixture('openstack/tenantId.json'))
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          },
          tenantId: '72e90ecb69c44d0296072ea39e537041'
        }
      })
      .reply(200, helpers.loadFixture('openstack/realToken.json'));

    b = nock('http://compute.myownendpoint.org:8774')
      .get('/v2/')
      .reply(200, helpers.loadFixture('openstack/versions.json'));
  }
  else if (provider === 'joyent') {
    a = nock('https://' + client.serversUrl)
      .get('/' + client.account + '/datacenters')
      .reply(200, '', { 'x-api-version': '6.5.0' });
  }

  return a ? (b ? [a, b] : [a]) : [];
}

function setupFlavorMock(client, provider) {

  var a, b;

  if (provider === 'rackspace') {
    a = nock('https://' + client.authUrl)
      .get('/v1.0')
      .reply(204, '', JSON.parse(helpers.loadFixture('rackspace/auth.json')));

    b = nock('https://' + client.serversUrl)
      .get('/v1.0/537645/flavors/detail.json')
      .reply(200, helpers.loadFixture('rackspace/serverFlavors.json'), {});
  }
  else if (provider === 'openstack') {
    a = nock('http://compute.myownendpoint.org:8774')
      .get('/v2/72e90ecb69c44d0296072ea39e537041/flavors/detail')
      .reply(200, helpers.loadFixture('openstack/flavors.json'));
  }
  else if (provider === 'joyent') {
    a = nock('https://' + client.serversUrl)
      .get('/' + client.account + '/packages')
      .reply(200, helpers.loadFixture('joyent/flavors.json'), {});
  }

  return a ? (b ? [a, b] : [a]) : [];
}

function setupImagesMock(client, provider) {

  var a;

  if (provider === 'rackspace') {
    a = nock('https://' + client.serversUrl)
      .get('/v1.0/537645/images/detail.json')
      .reply(200, helpers.loadFixture('rackspace/images.json'), {})
  }
  else if (provider === 'openstack') {
    a = nock('http://compute.myownendpoint.org:8774')
      .get('/v2/72e90ecb69c44d0296072ea39e537041/images/detail')
      .reply(200, helpers.loadFixture('openstack/images.json'));
  }
  else if (provider === 'joyent') {
    a = nock('https://' + client.serversUrl)
      .get('/' + client.account + '/datasets')
      .reply(200, helpers.loadFixture('joyent/images.json'), {});
  }
  else if (provider === 'amazon') {
    a = nock('https://' + client.serversUrl)
      .filteringRequestBody(helpers.authFilter)
      .post('/?Action=DescribeImages', { 'Owner.0': 'self' })
      .reply(200, helpers.loadFixture('amazon/images.xml'), {});
  }
  else if (provider === 'azure') {
    a = nock('https://' + client.serversUrl)
      .get('/azure-account-subscription-id/services/images')
      .reply(200, helpers.loadFixture('azure/images.xml'), {})
  }

  return [a];
}

function setupServerMock(client, provider) {

  var a, b;

  if (provider === 'rackspace') {
    a = nock('https://' + client.serversUrl)
      .post('/v1.0/537645/servers',
        helpers.loadFixture('rackspace/setWait.json'))
      .reply(202, helpers.loadFixture('rackspace/setWaitResp2.json'), {})
      .get('/v1.0/537645/servers/20602046')
      .reply(200, helpers.loadFixture('rackspace/20602046.json'), {});
  }
  else if (provider === 'openstack') {
    a = nock('http://compute.myownendpoint.org:8774')
      .post('/v2/72e90ecb69c44d0296072ea39e537041/servers', {
        server: {
          name: 'create-test-setWait',
          flavorRef: 1,
          imageRef: '506d077e-66bf-44ff-907a-588c5c79fa66',
          personality: [],
          key_name: null
        }
      })
      .reply(202, helpers.loadFixture('openstack/creatingServer.json'))
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .reply(200, helpers.loadFixture('openstack/serverCreated.json'))
  }
  else if (provider === 'joyent') {
    a = nock('https://' + client.serversUrl)
      .post('/' + client.account + '/machines',
      { name: 'create-test-setWait',
        'package': 'Small 1GB',
        dataset: 'sdc:sdc:nodejitsu:1.0.0'
      })
      .reply(201, helpers.loadFixture('joyent/setWait.json'), {})
      .get('/' + client.account +
        '/machines/534aa63a-104f-4d6d-a3b1-c0d341a20a53')
      .reply(200, helpers.loadFixture('joyent/setWaitResp1.json'), {});
  }
  else if (provider === 'amazon') {
    a = nock('https://' + client.serversUrl)
      .filteringRequestBody(helpers.authFilter)
      .post('/?Action=RunInstances', {
        'ImageId': 'ami-85db1cec',
        'InstanceType': 'm1.small',
        'MaxCount': '1',
        'MinCount': '1',
        'UserData': 'eyJuYW1lIjoiY3JlYXRlLXRlc3Qtc2V0V2FpdCJ9'
      })
      .reply(200, helpers.loadFixture('amazon/run-instances.xml'), {})
      .post('/?Action=DescribeInstances', {
        'Filter.1.Name': 'instance-state-code',
        'Filter.1.Value.1': '0',
        'Filter.1.Value.2': '16',
        'Filter.1.Value.3': '32',
        'Filter.1.Value.4': '64',
        'Filter.1.Value.5': '80',
        'InstanceId.1': 'i-1d48637b'
      })
      .reply(200, helpers.loadFixture('amazon/pending-server.xml'), {})
      .post('/?Action=DescribeInstanceAttribute', {
        'Attribute': 'userData',
        'InstanceId': 'i-1d48637b'
      })
      .reply(200,
        helpers.loadFixture('amazon/running-server-attr.xml', {}))
      .post('/?Action=DescribeInstances', {
        'Filter.1.Name': 'instance-state-code',
        'Filter.1.Value.1': '0',
        'Filter.1.Value.2': '16',
        'Filter.1.Value.3': '32',
        'Filter.1.Value.4': '64',
        'Filter.1.Value.5': '80',
        'InstanceId.1': 'i-1d48637b'
      })
      .reply(200, helpers.loadFixture('amazon/running-server.xml'), {})
      .post('/?Action=DescribeInstanceAttribute', {
        'Attribute': 'userData',
        'InstanceId': 'i-1d48637b'
      })
      .reply(200,
        helpers.loadFixture('amazon/running-server-attr.xml', {}));

  }
  else if (provider === 'azure') {
    a = nock('https://' + client.serversUrl)
      .get('/azure-account-subscription-id/services/hostedservices/create-test-setWait?embed-detail=true')
      .reply(404,helpers.loadFixture('azure/hosted-service-404.xml'),{})
      .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-hosted-service.xml'))
      .reply(201, "", {
        location: 'https://management.core.windows.net/subscriptions/azure-account-subscription-id/compute/create-test-setWait',
        'x-ms-request-id': 'b67cc525ecc546618fd6fb3e57d724f5'})
      .get('/azure-account-subscription-id/operations/b67cc525ecc546618fd6fb3e57d724f5')
      .reply(200, helpers.loadFixture('azure/operation-succeeded.xml'),{ })
      .get('/azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
      .reply(200,helpers.loadFixture('azure/image-1.xml'),{})
      .post('/azure-account-subscription-id/services/hostedservices/create-test-setWait/deployments', helpers.loadFixture('azure/create-deployment.xml'))
      .reply(202, "", {'x-ms-request-id': 'b67cc525ecc546618fd6fb3e57d724f5'})
      .get('/azure-account-subscription-id/operations/b67cc525ecc546618fd6fb3e57d724f5')
      .reply(200, helpers.loadFixture('azure/operation-inprogress.xml'),{ })
      .get('/azure-account-subscription-id/operations/b67cc525ecc546618fd6fb3e57d724f5')
      .reply(200, helpers.loadFixture('azure/operation-succeeded.xml'),{ })
      // TODO: have to do this twice as setWait() does not check server status before calling server.refresh()?
      .get('/azure-account-subscription-id/services/hostedservices/create-test-setWait?embed-detail=true')
      .reply(200, helpers.loadFixture('azure/running-server.xml'), {})
      .get('/azure-account-subscription-id/services/hostedservices/create-test-setWait?embed-detail=true')
      .reply(200, helpers.loadFixture('azure/running-server.xml'), {});

    b = nock('https://' + client.serversUrl)
          .filteringRequestBody(/.*/, '*')
          .post('/azure-account-subscription-id/services/hostedservices/create-test-setWait/certificates', '*')
           .reply(202, "", {'x-ms-request-id': 'b67cc525ecc546618fd6fb3e57d724f5'})
           .get('/azure-account-subscription-id/operations/b67cc525ecc546618fd6fb3e57d724f5')
          .reply(200, helpers.loadFixture('azure/operation-succeeded.xml'),{ });
  }

  return a ? (b ? [a, b] : [a]) : [];
}

function setupDestroyMock(client, provider) {

  var a;

  if (provider === 'rackspace') {
    a = nock('https://' + client.serversUrl)
      .delete('/v1.0/537645/servers/20602046')
      .reply(204, "", {})
  }
  else if (provider === 'openstack') {
    a = nock('http://compute.myownendpoint.org:8774')
      .delete('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .reply(204, "");
  }

  return [a];
}
