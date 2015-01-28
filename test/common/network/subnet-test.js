/*
* subnet-test.js: Test that should be common to all providers.
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    http = require('http'),
    hock = require('hock'),
    providers = require('../../configs/providers.json'),
    Subnet = require('../../../lib/pkgcloud/core/network/subnet').Subnet,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

// Declaring variables for helper functions defined later
var setupDestroySubnetMock, setupUpdateSubnetMock, setupModelDestroyedSubnetMock,
    setupSubnetsMock, setupCreateSubnetMock, setupRefreshSubnetMock,
    setupSubnetModelCreateMock, setupGetSubnetMock;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {
  describe('pkgcloud/common/network/subnets [' + provider + ']', function () {

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

    it('the getSubnets() function should return a list of subnets', function(done) {

      if (mock) {
        setupSubnetsMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getSubnets(function (err, subnets) {
        should.not.exist(err);
        should.exist(subnets);

        context.subnets = subnets;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getSubnet() method should get a subnet instance', function (done) {
      if (mock) {
        setupGetSubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        },context.subnets[0]);
      }

      client.getSubnet(context.subnets[0].id, function (err, subnet) {
        should.not.exist(err);
        should.exist(subnet);
        subnet.should.be.an.instanceOf(Subnet);
        subnet.should.have.property('id', context.subnets[0].id);
        context.currentSubnet = subnet;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the createSubnet() method should create a subnet', function (done) {
      if (mock) {
        setupCreateSubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createSubnet({
        name: 'create-test-ids2'
      }, function (err, subnet) {
        should.not.exist(err);
        should.exist(subnet);
        subnet.should.be.an.instanceOf(Subnet);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the destroySubnet() method should delete a subnet', function (done) {
      if (mock) {
        setupDestroySubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSubnet);
      }

      client.destroySubnet(context.currentSubnet, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the destroySubnet() method should take an id, delete a subnet', function (done) {
      if (mock) {
        setupDestroySubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSubnet);
      }

      client.destroySubnet(context.currentSubnet.id, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the updateSubnet() method should update a subnet', function (done) {

      var subnetToUpdate = context.currentSubnet;
      subnetToUpdate.enableDhcp = false;

      if (mock) {
        setupUpdateSubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, subnetToUpdate);
      }

      client.updateSubnet(subnetToUpdate, function(err,network){
        should.not.exist(err);
        should.exist(network);
        done();
      });
    });

    it('the subnet.create() method should create a subnet', function (done) {
      if (mock) {
        setupSubnetModelCreateMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var subnet = new Subnet(client);
      subnet.name= 'model created network';
      subnet.create(function (err, createdSubnet) {
        should.not.exist(err);
        should.exist(createdSubnet);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the subnet.refresh() method should get a network', function (done) {
      var subnet = new Subnet(client);
      subnet.id = 'd32019d3-bc6e-4319-9c1d-6722fc136a22';

      if (mock) {
        setupRefreshSubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, subnet);
      }

      subnet.refresh(function (err, refreshedSubnet) {
        should.not.exist(err);
        should.exist(refreshedSubnet);
        refreshedSubnet.should.have.property('name', 'my_subnet');
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the subnet.destroy() method should delete a subnet', function (done) {
      var subnet = new Subnet(client);
      subnet.name = 'model deleted subnet';
      subnet.id = 'THISISANETWORKID';

      if (mock) {
        setupModelDestroyedSubnetMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, subnet);
      }

      subnet.destroy(function (err) {
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

setupDestroySubnetMock = function (client, provider, servers, currentSubnet){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
};

setupUpdateSubnetMock = function (client, provider, servers, currentSubnet){
  if (provider === 'openstack') {
    servers.server
        .put(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', currentSubnet.id), {
          subnet: {
            name: 'my_subnet',
            network_id: 'd32019d3-bc6e-4319-9c1d-6722fc136a22',
            tenant_id: '4fd44f30292945e481c7b8a0c8908869',
            allocation_pools: [
              {
                start: '192.0.0.2',
                end: '192.255.255.254'
              }
            ],
            gateway_ip: '192.0.0.1',
            ip_version: 4,
            cidr: '192.0.0.0/8',
            enable_dhcp: false
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'hp') {
    servers.server
        .put(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', currentSubnet.id), {
          subnet: {
            name: 'my_subnet',
            network_id: 'd32019d3-bc6e-4319-9c1d-6722fc136a22',
            tenant_id: '4fd44f30292945e481c7b8a0c8908869',
            allocation_pools: [
              {
                start: '192.0.0.2',
                end: '192.255.255.254'
              }
            ],
            gateway_ip: '192.0.0.1',
            ip_version: 4,
            cidr: '192.0.0.0/8',
            enable_dhcp: false
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'rackspace') {
    servers.server
        .put(urlJoin('/v2.0/subnets', currentSubnet.id), {
          subnet: {
            name: 'my_subnet',
            network_id: 'd32019d3-bc6e-4319-9c1d-6722fc136a22',
            tenant_id: '4fd44f30292945e481c7b8a0c8908869',
            allocation_pools: [
              {
                start: '192.0.0.2',
                end: '192.255.255.254'
              }
            ],
            gateway_ip: '192.0.0.1',
            ip_version: 4,
            cidr: '192.0.0.0/8',
            enable_dhcp: false
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/subnet.json');
  }
};

setupModelDestroyedSubnetMock = function (client, provider, servers, currentSubnet){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/subnets', currentSubnet.id))
      .reply(204);
  }
};

setupSubnetsMock = function (client, provider, servers) {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnets.json');
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
        .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnets.json');
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
        .get('/v2.0/subnets')
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/subnets.json');
  }
};

setupCreateSubnetMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', {
        subnet: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', {
        subnet: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/subnets', {
        subnet: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/subnet.json');
  }
};

setupRefreshSubnetMock = function (client, provider, servers, subnet) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', subnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', subnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/subnets', subnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/subnet.json');
  }
};

setupSubnetModelCreateMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', {
        subnet: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', {
        subnet: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/subnets', {
        subnet: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/rackspace/subnet.json');
  }
};

setupGetSubnetMock= function (client, provider, servers, currentSubnet) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/subnets', currentSubnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/subnets', currentSubnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/subnet.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/subnets', currentSubnet.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/subnet.json');
  }
};
