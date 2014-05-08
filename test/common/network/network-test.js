/*
* server-test.js: Test that should be common to all providers.
*
* (C) 2012 Nodejitsu Inc.
*
*/

var fs = require('fs'),
    path = require('path'),
    qs = require('qs'),
    should = require('should'),
    utile = require('utile'),
    async = require('async'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    async = require('async'),
    _ = require('underscore'),
    providers = require('../../configs/providers.json'),
    Network = require('../../../lib/pkgcloud/core/network/network').Network,
    mock = !!process.env.MOCK;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {
  describe('pkgcloud/common/network/networks [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'network'),
      context = {},
      authServer, server;

    before(function (done) {

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock({
            port: 12345,
            throwOnUnmatched: false
          }, function (err, hockClient) {
            server = hockClient;
            next();
          });
        },
        function (next) {
          hock.createHock(12346, function (err, hockClient) {
            authServer = hockClient;
            next();
          });
        }
      ], done)
    });

    it('the getNetworks() function should return a list of networks', function(done) {

      if (mock) {
        setupNetworksMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.getNetworks(function (err, networks) {
        should.not.exist(err);
        should.exist(networks);

        context.networks = networks;

        authServer && authServer.done();
        server && server.done();

        done();
      });
    });

    it.skip('the createServer() method with image and flavor should create a server', function (done) {
      var m = mock ? .1 : 10;

      if (mock) {
        setupServerMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.createServer(utile.mixin({
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

          authServer && authServer.done();
          server && server.done();
          done();
        });
      });
    });

    it('the getNetwork() method should get a network instance', function (done) {
      if (mock) {
        setupGetNetworkMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.getNetwork(context.networks[0].id, function (err, network) {
        should.not.exist(err);
        should.exist(network);

        context.currentNetwork = network;

        authServer && authServer.done();
        server && server.done();
        done();

      });
    });

    it.skip('the destroyServer() method should delete a server instance', function (done) {
      if (mock) {
        setupRebootMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      context.currentServer.reboot(function (err) {
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
      ], done)
    });

  });
});

function setupNetworksMock(client, provider, servers) {
  if (provider === 'openstack') {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks?format=json')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/networks.json');
  }
}

function setupServerMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/servers',
      {server: {name: 'create-test-ids2', flavorRef: '1', imageRef: '506d077e-66bf-44ff-907a-588c5c79fa66'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/creatingServer.json')
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverCreated2.json');
  }
}

function setupGetServersMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/serverList.json');
  }
}

function setupGetNetworkMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks/d32019d3-bc6e-4319-9c1d-6722fc136a22')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
}

var serverStatusReply = function (name, status) {

  var template = helpers.loadFixture('azure/server-status-template.xml'),
    params = {NAME: name, STATUS: status};

  var result = _.template(template, params);
  return result;
};

var filterPath = function (path) {
  var name = PATH.basename(path);
  if (path.search('embed-detail=true') !== -1) {
    return '/getStatus?name=' + name;
  }

  return path;
};
