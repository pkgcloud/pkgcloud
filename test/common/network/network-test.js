/*
* network-test.js: Test that should be common to all providers.
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    http = require('http'),
    hock = require('hock'),
    _ = require('lodash'),
    providers = require('../../configs/providers.json'),
    Network = require('../../../lib/pkgcloud/core/network/network').Network,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

// Declaring variables for helper functions defined later
var setupDestroyNetworkMock, setupUpdateNetworkMock, setupModelDestroyedNetworkMock,
    setupNetworksMock, setupNetworkMock, setupRefreshNetworkMock,
    setupNetworkModelCreateMock, setupGetNetworkMock;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {
  describe('pkgcloud/common/network/networks [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'network'),
      context = {},
      authServer, server,
      authHockInstance, hockInstance;

    before(function (done) {

      if (!mock) {
        return done();
      }

      hockInstance = hock.createHock({ throwOnUnmatched: false });
      authHockInstance = hock.createHock();

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

    it('the getNetworks() function should return a list of networks', function(done) {

      if (mock) {
        setupNetworksMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getNetworks(function (err, networks) {
        should.not.exist(err);
        should.exist(networks);

        context.networks = networks;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getNetwork() method should get a network instance', function (done) {
      if (mock) {
        setupGetNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getNetwork(context.networks[0].id, function (err, network) {
        should.not.exist(err);
        should.exist(network);
        network.should.be.an.instanceOf(Network);
        network.should.have.property('id', context.networks[0].id);
        context.currentNetwork = network;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the createNetwork() method should create a network', function (done) {
      if (mock) {
        setupNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createNetwork(_.extend({
        name: 'create-test-ids2'
      }), function (err, network) {
        should.not.exist(err);
        should.exist(network);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the destroyNetwork() method should delete a network', function (done) {
      if (mock) {
        setupDestroyNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentNetwork);
      }

      client.destroyNetwork(context.currentNetwork, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the destroyNetwork() method should take an id, delete a network', function (done) {
      if (mock) {
        setupDestroyNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentNetwork);
      }

      client.destroyNetwork(context.currentNetwork.id, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the updateNetwork() method should update a network', function (done) {

      var networkToUpdate = context.currentNetwork;
      networkToUpdate.adminStateUp = false;

      if (mock) {
        setupUpdateNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, networkToUpdate);
      }

      client.updateNetwork(networkToUpdate, function(err,network){
        should.not.exist(err);
        should.exist(network);
        done();
      });
    });

    it('the network.create() method should create a network', function (done) {
      if (mock) {
        setupNetworkModelCreateMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var network = new Network(client);
      network.name = 'model created network';
      network.create(function (err, createdNetwork) {
        should.not.exist(err);
        should.exist(createdNetwork);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the network.refresh() method should get a network', function (done) {
      var network = new Network(client);
      network.id = 'd32019d3-bc6e-4319-9c1d-6722fc136a22';

      if (mock) {
        setupRefreshNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, network);
      }

      network.refresh(function (err, refreshedNetwork) {
        should.not.exist(err);
        should.exist(refreshedNetwork);
        refreshedNetwork.should.have.property('name', 'private-network');
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the network.destroy() method should delete a network', function (done) {
      var network = new Network(client);
      network.name = 'model deleted network';
      network.id = 'THISISANETWORKID';

      if (mock) {
        setupModelDestroyedNetworkMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
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
          server.close(next);
        },
        function (next) {
          authServer.close(next);
        }
      ], done);
    });

  });
});

setupDestroyNetworkMock = function (client, provider, servers, currentNetwork){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
};

setupUpdateNetworkMock = function (client, provider, servers, currentNetwork){
  if (provider === 'openstack') {
    servers.server
        .put(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', currentNetwork.id), {
          network: {
            admin_state_up: false,
            name: 'private-network',
            shared: true,
            tenant_id: '4fd44f30292945e481c7b8a0c8908869'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'hp') {
    servers.server
        .put(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks', currentNetwork.id), {
          network: {
            admin_state_up: false,
            name: 'private-network',
            shared: true,
            tenant_id: '4fd44f30292945e481c7b8a0c8908869'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'rackspace') {
    servers.server
        .put(urlJoin('/v2.0/networks', currentNetwork.id), {
          network: {
            admin_state_up: false,
            name: 'private-network',
            shared: true,
            tenant_id: '4fd44f30292945e481c7b8a0c8908869'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/network.json');
  }
};

setupModelDestroyedNetworkMock = function (client, provider, servers, currentNetwork){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/networks', currentNetwork.id))
      .reply(204);
  }
};

setupNetworksMock = function (client, provider, servers) {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/networks.json');
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
        .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks')
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/networks.json');
  }
  else if (provider === 'rackspace') {
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
        .get('/v2.0/networks')
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/networks.json');
  }
};

setupNetworkMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', {
        network: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks', {
        network: {
         name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/networks', {
        network: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/network.json');
  }
};

setupRefreshNetworkMock = function (client, provider, servers, network) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks',network.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks',network.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/networks',network.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/network.json');
  }
};

setupNetworkModelCreateMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks', {
        network: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks', {
        network: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/networks', {
        network: {
          name: 'model created network'
        }
      })
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/network.json');
  }
};

setupGetNetworkMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/networks/d32019d3-bc6e-4319-9c1d-6722fc136a22')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/networks/d32019d3-bc6e-4319-9c1d-6722fc136a22')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/network.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get('/v2.0/networks/d32019d3-bc6e-4319-9c1d-6722fc136a22')
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/network.json');
  }
};
