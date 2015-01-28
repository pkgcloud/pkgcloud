/*
* port-test.js: Test that should be common to all providers.
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    http = require('http'),
    providers = require('../../configs/providers.json'),
    Port = require('../../../lib/pkgcloud/core/network/port').Port,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

// Declaring variables for helper functions defined later
var setupDestroyPortMock, setupUpdatePortMock, setupModelDestroyedPortMock,
    setupPortsMock, setupCreatePortMock, setupRefreshPortMock,
    setupPortModelCreateMock, setupGetPortMock;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {
  describe('pkgcloud/common/network/ports [' + provider + ']', function () {

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

    it('the getPorts() function should return a list of ports', function(done) {

      if (mock) {
        setupPortsMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getPorts(function (err, ports) {
        should.not.exist(err);
        should.exist(ports);

        context.ports = ports;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getPort() method should get a port instance', function (done) {
      if (mock) {
        setupGetPortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.ports[0]);
      }

      client.getPort(context.ports[0].id, function (err, port) {
        should.not.exist(err);
        should.exist(port);
        port.should.be.an.instanceOf(Port);
        port.should.have.property('id', context.ports[0].id);
        context.currentPort = port;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the createPort() method should create a port', function (done) {
      if (mock) {
        setupCreatePortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createPort({
        name: 'create-test-ids2'
      }, function (err, port) {
        should.not.exist(err);
        should.exist(port);
        port.should.be.an.instanceOf(Port);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the destroyPort() method should delete a port', function (done) {
      if (mock) {
        setupDestroyPortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentPort);
      }

      client.destroyPort(context.currentPort, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the destroyPort() method should take an id, delete a port', function (done) {
      if (mock) {
        setupDestroyPortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentPort);
      }

      client.destroyPort(context.currentPort.id, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the updatePort() method should update a port', function (done) {

      var portToUpdate = context.currentPort;
      portToUpdate.adminStateUp = false;

      if (mock) {
        setupUpdatePortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, portToUpdate);
      }

      client.updatePort(portToUpdate, function(err,network){
        should.not.exist(err);
        should.exist(network);
        done();
      });
    });

    it('the port.create() method should create a port', function (done) {
      if (mock) {
        setupPortModelCreateMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var port = new Port(client);
      port.name= 'model created network';
      port.create(function (err, createdPort) {
        should.not.exist(err);
        should.exist(createdPort);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the port.refresh() method should get a network', function (done) {
      var port = new Port(client);
      port.id = context.ports[0].id;

      if (mock) {
        setupRefreshPortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, port);
      }

      port.refresh(function (err, refreshedPort) {
        should.not.exist(err);
        should.exist(refreshedPort);
        refreshedPort.should.have.property('name', 'my_port');
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the port.destroy() method should delete a port', function (done) {
      var port = new Port(client);
      port.name = 'model deleted port';
      port.id = 'THISISANETWORKID';

      if (mock) {
        setupModelDestroyedPortMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, port);
      }

      port.destroy(function (err) {
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

setupDestroyPortMock = function (client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/ports', currentPort.id))
      .reply(204);
  }
};

setupUpdatePortMock = function (client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
        .put(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id), {
          port: {
            status: 'ACTIVE',
            name: 'my_port',
            admin_state_up: false,
            mac_address: 'fa:16:3e:58:42:ed',
            fixed_ips: [
              {
                subnet_id: '008ba151-0b8c-4a67-98b5-0d2b87666062',
                ip_address: '172.24.4.2'
              }
            ],
            security_groups:[],
            network_id: '70c1db1f-b701-45bd-96e0-a313ee3430b3'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
        .put(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id), {
          port: {
            status: 'ACTIVE',
            name: 'my_port',
            admin_state_up: false,
            mac_address: 'fa:16:3e:58:42:ed',
            fixed_ips: [
              {
                subnet_id: '008ba151-0b8c-4a67-98b5-0d2b87666062',
                ip_address: '172.24.4.2'
              }
            ],
            security_groups:[],
            network_id: '70c1db1f-b701-45bd-96e0-a313ee3430b3'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'rackspace') {
    servers.server
        .put(urlJoin('/v2.0/ports', currentPort.id), {
          port: {
            status: 'ACTIVE',
            name: 'my_port',
            admin_state_up: false,
            mac_address: 'fa:16:3e:58:42:ed',
            fixed_ips: [
              {
                subnet_id: '008ba151-0b8c-4a67-98b5-0d2b87666062',
                ip_address: '172.24.4.2'
              }
            ],
            security_groups:[],
            network_id: '70c1db1f-b701-45bd-96e0-a313ee3430b3'
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/port.json');
  }
};

setupModelDestroyedPortMock = function (client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/ports', currentPort.id))
      .reply(204);
  }
};

setupPortsMock = function (client, provider, servers) {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/ports.json');
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
        .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/ports.json');
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
        .get('/v2.0/ports')
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/ports.json');
  }
};

setupCreatePortMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', {
        port: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', {
        port: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/ports', {
        port: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/port.json');
  }
};

setupRefreshPortMock = function (client, provider, servers, port) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', port.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', port.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/ports', port.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/port.json');
  }
};

setupPortModelCreateMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', {
        port: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', {
        port: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/ports', {
        port: {
          name: 'model created network'
        }
      })
      .replyWithFile(202, __dirname + '/../../fixtures/rackspace/port.json');
  }
};

setupGetPortMock = function (client, provider, servers, currentPort) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/ports', currentPort.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/port.json');
  }
};
