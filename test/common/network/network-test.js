/*
* network-test.js: Test that should be common to all providers.
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
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
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

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
      ], done);
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
        network.should.be.an.instanceOf(Network);
        network.should.have.property('id', context.networks[0].id);
        context.currentNetwork = network;

        authServer && authServer.done();
        server && server.done();
        done();

      });
    });

    it('the createNetwork() method should create a network', function (done) {
      var m = mock ? 0.1 : 10;

      if (mock) {
        setupNetworkMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.createNetwork(utile.mixin({
        name: 'create-test-ids2'
      }), function (err, network) {
        should.not.exist(err);
        should.exist(network);
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the destroyNetwork() method should delete a network', function (done) {
      if (mock) {
        setupDestroyNetworkMock(client, provider, {
          authServer: authServer,
          server: server
        }, context.currentNetwork);
      }

      context.currentNetwork.destroy(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the network.Create() method should create a network', function (done) {
      var m = mock ? 0.1 : 10;

      if (mock) {
        setupNetworkModelCreateMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      var network = new Network(client);
      network.name= "model created network";
      network.create(function (err, createdNetwork) {
        should.not.exist(err);
        should.exist(createdNetwork);
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the network.refresh() method should get a network', function (done) {
      var m = mock ? 0.1 : 10;

      var network = new Network(client);
      network.id = "d32019d3-bc6e-4319-9c1d-6722fc136a22";

      if (mock) {
        setupRefreshNetworkMock(client, provider, {
          authServer: authServer,
          server: server
        }, network);
      }

      network.refresh(function (err, refreshedNetwork) {
        should.not.exist(err);
        should.exist(refreshedNetwork);
        refreshedNetwork.should.have.property('name', 'private-network');
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the network.destroy() method should delete a network', function (done) {
      var network = new Network(client);
      network.name = "model deleted network";
      network.id = "THISISANETWORKID";

      if (mock) {
        setupModelDestroyedNetworkMock(client, provider, {
          authServer: authServer,
          server: server
        }, network);
      }

      network.destroy(function (err) {
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

function setupDestroyNetworkMock(client,provider,servers,currentNetwork){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', currentNetwork.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
}


function setupModelDestroyedNetworkMock(client,provider,servers,currentNetwork){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', currentNetwork.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
}

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

function setupNetworkMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks',
      {network: {name: 'create-test-ids2'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/network.json');
  }
}

function setupRefreshNetworkMock(client, provider, servers, network) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks',network.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
}

function setupNetworkModelCreateMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks',
      {network: {name: 'model created network'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/network.json');
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
