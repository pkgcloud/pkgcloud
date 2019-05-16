/*
* server-test.js: Test that should be common to all providers.
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
*
*/

var should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    http = require('http'),
    hock = require('hock'),
    _ = require('lodash'),
    providers = require('../../configs/providers.json'),
    Server = require('../../../lib/pkgcloud/core/compute/server').Server,
    azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi'),
    mock = !!process.env.MOCK;

var azureOptions = require('../../fixtures/azure/azure-options.json');

// Declaring variables for helper functions defined later
var setupImagesMock, setupFlavorMock, setupServerMock, setupGetServersMock,
    setupGetServerMock, setupRebootMock, serverStatusReply;

azureApi._updateMinimumPollInterval(mock ? 10 : azureApi.MINIMUM_POLL_INTERVAL);

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].compute;
}).forEach(function (provider) {
  describe('pkgcloud/common/compute/server [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'compute'),
      context = {},
      authServer, server,
      authHockInstance,
      hockInstance;

    before(function (done) {

      if (!mock) {
        return done();
      }

      hockInstance = hock.createHock({ throwOnUnmatched: false });
      authHockInstance = hock.createHock();

      // setup a filtering path for aws
      hockInstance.filteringPathRegEx(/https:\/\/ec2\.us-west-2\.amazonaws\.com([?\w\-\.\_0-9\/]*)/g, '$1');

      server = http.createServer(hockInstance.handler);
      authServer = http.createServer(authHockInstance.handler);

      async.parallel([
        function (next) {
          server.listen(12345, next);
        },
        function (next) {
          authServer.listen(12346, next);
        }
      ], done);
    });

    it('the getImages() function should return a list of images', function(done) {

      if (mock) {
        setupImagesMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getImages(function (err, images) {
        should.not.exist(err);
        should.exist(images);

        context.images = images;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getFlavors() function should return a list of flavors', function (done) {

      if (mock) {
        setupFlavorMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getFlavors(function (err, flavors) {
        should.not.exist(err);
        should.exist(flavors);

        context.flavors = flavors;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the createServer() method with image and flavor should create a server', function (done) {
      var m = mock ? .1 : 10;

      if (mock) {
        setupServerMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createServer(_.extend({
        name: 'create-test-ids2',
        image: context.images[0].id,
        flavor: context.flavors[0].id
      }, provider === 'azure' ? azureOptions : {}), function (err, srv1) {
        should.not.exist(err);
        should.exist(srv1);

        srv1.setWait({ status: srv1.STATUS.running }, 100 * m, function (err, srv2) {
          should.not.exist(err);
          should.exist(srv2);
          srv2.should.be.instanceOf(Server);
          srv2.name.should.equal('create-test-ids2');
          srv2.imageId.should.equal(context.images[0].id);

          authHockInstance && authHockInstance.done();
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getServers() method should return a list of servers', function (done) {
      if (mock) {
        setupGetServersMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getServers(function (err, servers) {
        should.not.exist(err);
        should.exist(servers);

        servers.should.be.an.Array;

        servers.forEach(function(srv) {
          srv.should.be.instanceOf(Server);
        });

        context.servers = servers;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the getServer() method should get a server instance', function (done) {
      if (mock) {
        setupGetServerMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getServer(context.servers[0].id, function (err, srv) {
        should.not.exist(err);
        should.exist(srv);

        srv.should.be.instanceOf(Server);

        context.currentServer = hockInstance;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it.skip('the server.rebootServer() method should restart a server instance', function (done) {
      if (mock) {
        setupRebootMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      context.currentServer.reboot(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it.skip('the destroyServer() method should delete a server instance', function (done) {
      if (mock) {
        setupRebootMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      context.currentServer.reboot(function (err) {
        should.not.exist(err);
        done();
      });
    });

    after(function (done) {
      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          authServer.close(next);
        },
        function (next) {
          server.close(next);
        }
      ], done);
    });

  });
});

setupImagesMock = function (client, provider, servers) {
  if (provider === 'rackspace') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          'RAX-KSKEY:apiKeyCredentials': {
            username: 'MOCK-USERNAME',
            apiKey: 'MOCK-API-KEY'
          }
        }
      })
      .reply(200, helpers.getRackspaceAuthResponse());

    servers.server
      .get('/v2/123456/images/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/images.json');
  }
  else if (provider === 'openstack') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
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
            password: 'MOCK-PASSWORD'
          },
          tenantId: '72e90ecb69c44d0296072ea39e537041'
        }
      })
      .reply(200, helpers.getOpenstackAuthResponse());

    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/images/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/images.json');
  }
  else if (provider === 'amazon') {
    servers.server
      .filteringRequestBody(helpers.authFilter)
      .post('/',
        { Action: 'DescribeImages',
          'Owner.1': 'self' },
        { 'User-Agent': client.userAgent })
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/images.xml');
  }
  else if (provider === 'azure') {
    servers.server
      .get('/azure-account-subscription-id/services/images')
      .replyWithFile(200, __dirname + '/../../fixtures/azure/images.xml');
  }
  else if (provider === 'digitalocean') {
    servers.server
      .get('/v2/images?per_page=200&page=1')
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/images.json');
  }
  else if (provider === 'hp') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          }
        }
      })
      .replyWithFile(200, __dirname + '/../../fixtures/hp/initialToken.json')
      .get('/v2.0/tenants')
      .replyWithFile(200, __dirname + '/../../fixtures/hp/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          },
          tenantId: '5ACED3DC3AA740ABAA41711243CC6949'
        }
      })
      .reply(200, helpers.gethpAuthResponse());

    servers.server
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/images/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/hp/images.json');
  }
  else if (provider === 'oneandone') {
    servers.server
    .get('/server_appliances')
    .replyWithFile(200, __dirname + '/../../fixtures/oneandone/listImages.json');
  }
};

setupFlavorMock = function (client, provider, servers) {
  if (provider === 'rackspace') {
    servers.server
      .get('/v2/123456/flavors/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/flavors.json');
  }
  else if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/flavors/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/flavors.json');
  }
  else if (provider === 'digitalocean') {
    servers.server
      .get('/v2/sizes')
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/flavors.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/flavors/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/hp/flavors.json');
  }
  else if (provider === 'oneandone') {
    servers.server
      .get('/servers/fixed_instance_sizes')
      .replyWithFile(200, __dirname + '/../../fixtures/oneandone/listFlavors.json');
  }
};

setupServerMock = function (client, provider, servers) {
  if (provider === 'digitalocean') {

    servers.server
      .post('/v2/droplets', {
        name: 'create-test-ids2',
        region: 'nyc3',
        size: '512mb',
        image: 119192817
      })
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/create-server2.json')
      .get('/v2/droplets/12345')
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/active2.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2/123456/servers', {
        server: {
          name: 'create-test-ids2',
          flavorRef: '2',
          imageRef: '9922a7c7-5a42-4a56-bc6a-93f857ae2346'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/rackspace/createdServer.json')
      .get('/v2/123456/servers/a0a5f183-b94e-4a41-a854-00aa00aa00aa')
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/a0a5f183-b94e-4a41-a854-00aa00aa00aa.json');
  }
  else if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/servers',
      {server: {name: 'create-test-ids2', flavorRef: '1', imageRef: '506d077e-66bf-44ff-907a-588c5c79fa66'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/creatingServer.json')
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverCreated2.json');
  }
  else if (provider === 'amazon') {
    servers.server
      .filteringRequestBody(helpers.authFilter)
      .post('/', {
        'Action': 'RunInstances',
        'ImageId': 'ami-85db1cec',
        'InstanceType': 'm1.small',
        'MaxCount': '1',
        'MinCount': '1',
        'UserData': 'eyJuYW1lIjoiY3JlYXRlLXRlc3QtaWRzMiJ9'
      }, { 'User-Agent': client.userAgent })
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/run-instances.xml')
//      .post('/?Action=DescribeInstances')
//      .replyWithFile(200, __dirname + '/../../fixtures/amazon/pending-server.xml')
      .post('/', {
        'Action':'DescribeInstanceAttribute',
        'Attribute': 'userData',
        'InstanceId': 'i-1d48637b'
      }, { 'User-Agent': client.userAgent })
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/running-server-attr2.xml')
      .post('/', {
        'Action': 'DescribeInstances',
        'Filter.1.Name': 'instance-state-code',
        'Filter.1.Value.1': '0',
        'Filter.1.Value.2': '16',
        'Filter.1.Value.3': '32',
        'Filter.1.Value.4': '64',
        'Filter.1.Value.5': '80',
        'InstanceId.1': 'i-1d48637b'
      }, { 'User-Agent': client.userAgent })
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/running-server.xml');
  }
  else if (provider === 'azure') {

    var requestId = 'b67cc525-ecc5-4661-8fd6-fb3e57d724f5';

    servers.server
      .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
      .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
      .replyWithFile(404, __dirname + '/../../fixtures/azure/hosted-service-404.xml')
      .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-test-ids2-hosted-service.xml'))
      .reply(201, '')
      .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
      .replyWithFile(200, __dirname + '/../../fixtures/azure/operation-succeeded.xml')
      .get('/azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
      .replyWithFile(200, __dirname + '/../../fixtures/azure/image-1.xml')
      .filteringRequestBodyRegEx(/.*/, '*')
      .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/certificates', '*')
      .reply(202)
      .clearBodyFilter()
      .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
      .replyWithFile(200, __dirname + '/../../fixtures/azure/operation-succeeded.xml')
      .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/deployments', helpers.loadFixture('azure/create-test-ids2.xml'))
      .reply(202)
      .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
      .replyWithFile(200, __dirname + '/../../fixtures/azure/operation-succeeded.xml')
      .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
      .reply(200, serverStatusReply('create-test-ids2', 'ReadyRole'))
      .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
      .reply(200, serverStatusReply('create-test-ids2', 'ReadyRole'));
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/servers',
      {server: {name: 'create-test-ids2', flavorRef: '1', imageRef: '506d077e-66bf-44ff-907a-588c5c79fa66'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/creatingServer.json')
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverCreated2.json');
  }
  else if (provider === 'oneandone') {
    servers.server
      .post('/servers', {
        name: 'create-test-ids2',
        hardware: {fixed_instance_size_id: '8C626C1A7005D0D1F527143C413D461E'}
        , appliance_id: 'A0FAA4587A7CB6BBAA1EA877C844977E'
      })
      .replyWithFile(202, __dirname + '/../../fixtures/oneandone/getServer.json')
      .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
      .replyWithFile(200, __dirname + '/../../fixtures/oneandone/getServer.json');
    }
};

setupGetServersMock = function (client, provider, servers) {
  if (provider === 'rackspace') {
    servers.server
      .get('/v2/123456/servers/detail')
      .replyWithFile(202, __dirname + '/../../fixtures/rackspace/servers.json');
  }
  else if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverList.json');
  }
  else if (provider === 'amazon') {
    servers.server
      .filteringRequestBody(helpers.authFilter)
      .post('/', {
        Action: 'DescribeInstances'
      }, { 'User-Agent': client.userAgent })
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/running-server.xml');
  }
  else if (provider === 'azure') {

    var requestId = 'b67cc525-ecc5-4661-8fd6-fb3e57d724f5';

    servers.server
      .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
      .get('/azure-account-subscription-id/services/hostedservices')
      .reply(200, '<HostedServices xmlns="http://schemas.microsoft.com/windowsazure" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>')
      .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
      .reply(200, serverStatusReply('create-test-ids2', 'ReadyRole'));
  }
  else if (provider === 'digitalocean') {
    servers.server
      .get('/v2/droplets?per_page=200&page=1')
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/list-servers.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/servers/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/hp/serverList.json');
  }
  else if (provider === 'oneandone') {
    servers.server
      .get('/servers')
      .replyWithFile(200, __dirname + '/../../fixtures/oneandone/listServers.json');
  }
};

setupGetServerMock = function (client, provider, servers) {
  if (provider === 'rackspace') {
    servers.server
      .get('/v2/123456/servers/a0a5f183-b94e-4a41-a854-00aa00aa00aa')
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/a0a5f183-b94e-4a41-a854-00aa00aa00aa.json');
  }
  else if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverCreated2.json');
  }
  else if (provider === 'amazon') {
    servers.server
      .filteringRequestBody(helpers.authFilter)
      .post('/?Action=DescribeInstances', {})
      .replyWithFile(200, __dirname + '/../../fixtures/amazon/running-server.xml');
  }
  else if (provider === 'azure') {

    var requestId = 'b67cc525-ecc5-4661-8fd6-fb3e57d724f5';
    
    servers.server
      .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
      .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
      .reply(200, serverStatusReply('create-test-ids2', 'ReadyRole'));
  }
  else if (provider === 'digitalocean') {
    servers.server
      .get('/v2/droplets/3164444')
      .replyWithFile(200, __dirname + '/../../fixtures/digitalocean/active.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverCreated2.json');
  }
  else if (provider === 'oneandone') {
    servers.server
      .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
      .replyWithFile(200, __dirname + '/../../fixtures/oneandone/getServer.json');
  }
};

setupRebootMock = function() {
  // TODO
};

/**
 - * serverStatusReply()
 - * fills in the nock xml reply from the server with server name and status
 - * @param name - name of the server
 - * @param status - status to be returned in reply
 - *  status should be:
 - *      ReadyRole - server is RUNNING
 - *      VMStopped - server is still PROVISIONING
 - *      Provisioning - server is still PROVISIONING
 - *      see lib/pkgcloud/azure/compute/server.js for more status values
 - *
 - * @return {String} - the xml reply containing the server name and status
 - */
serverStatusReply = function (name, status) {

  var template = helpers.loadFixture('azure/server-status-template.xml'),
    params = {NAME: name, STATUS: status},
    compiled = _.template(template);

  return compiled(params);
};
