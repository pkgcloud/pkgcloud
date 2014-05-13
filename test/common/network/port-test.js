/*
* port-test.js: Test that should be common to all providers.
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
    Port = require('../../../lib/pkgcloud/core/network/port').Port,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {
  describe('pkgcloud/common/network/ports [' + provider + ']', function () {

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

    it('the getPorts() function should return a list of ports', function(done) {

      if (mock) {
        setupPortsMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.getPorts(function (err, ports) {
        should.not.exist(err);
        should.exist(ports);

        context.ports = ports;

        authServer && authServer.done();
        server && server.done();

        done();
      });
    });

    it('the getPort() method should get a port instance', function (done) {
      if (mock) {
        setupGetPortMock(client, provider, {
          authServer: authServer,
          server: server
        }, context.ports[0]);
      }

      client.getPort(context.ports[0].id, function (err, port) {
        should.not.exist(err);
        should.exist(port);
        port.should.be.an.instanceOf(Port);
        port.should.have.property('id', context.ports[0].id);
        context.currentPort = port;

        authServer && authServer.done();
        server && server.done();
        done();

      });
    });

    it('the createPort() method should create a port', function (done) {
      var m = mock ? 0.1 : 10;

      if (mock) {
        setupCreatePortMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.createPort({
        name: 'create-test-ids2'
      }, function (err, port) {
        should.not.exist(err);
        should.exist(port);
        port.should.be.an.instanceOf(Port);

        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the destroyPort() method should delete a port', function (done) {
      if (mock) {
        setupDestroyPortMock(client, provider, {
          authServer: authServer,
          server: server
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
          authServer: authServer,
          server: server
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
          authServer: authServer,
          server: server
        }, portToUpdate);
      }

      client.updatePort(portToUpdate, function(err,network){
        should.not.exist(err);
        done();
      });
    });

    it('the port.create() method should create a port', function (done) {
      var m = mock ? 0.1 : 10;

      if (mock) {
        setupPortModelCreateMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      var port = new Port(client);
      port.name= "model created network";
      port.create(function (err, createdPort) {
        should.not.exist(err);
        should.exist(createdPort);
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the port.refresh() method should get a network', function (done) {
      var m = mock ? 0.1 : 10;

      var port = new Port(client);
      port.id = context.ports[0].id;

      if (mock) {
        setupRefreshPortMock(client, provider, {
          authServer: authServer,
          server: server
        }, port);
      }

      port.refresh(function (err, refreshedPort) {
        should.not.exist(err);
        should.exist(refreshedPort);
        refreshedPort.should.have.property('name', 'my_port');
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('the port.destroy() method should delete a port', function (done) {
      var port = new Port(client);
      port.name = "model deleted port";
      port.id = "THISISANETWORKID";

      if (mock) {
        setupModelDestroyedPortMock(client, provider, {
          authServer: authServer,
          server: server
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
          authServer.close(next);
        },
        function (next) {
          server.close(next);
        }
      ], done);
    });

  });
});

function setupDestroyPortMock(client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
}

function setupUpdatePortMock(client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
        .put(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id),
        {"port":{"status":"ACTIVE","name":"my_port","admin_state_up":false,"mac_address":"fa:16:3e:58:42:ed",
            "fixed_ips":[{"subnet_id":"008ba151-0b8c-4a67-98b5-0d2b87666062","ip_address":"172.24.4.2"}],
            "security_groups":[],"network_id":"70c1db1f-b701-45bd-96e0-a313ee3430b3"}
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
        .put(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id),
        {"port":{"status":"ACTIVE","name":"my_port","admin_state_up":false,"mac_address":"fa:16:3e:58:42:ed",
            "fixed_ips":[{"subnet_id":"008ba151-0b8c-4a67-98b5-0d2b87666062","ip_address":"172.24.4.2"}],
            "security_groups":[],"network_id":"70c1db1f-b701-45bd-96e0-a313ee3430b3"}
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/port.json');
  }
}

function setupModelDestroyedPortMock(client, provider, servers, currentPort){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports', currentPort.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports', currentPort.id))
      .reply(204, helpers.getOpenstackAuthResponse());
  }
}

function setupPortsMock(client, provider, servers) {
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
}

function setupCreatePortMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports',
      {port: {name: 'create-test-ids2'}})
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports',
      {port: {name: 'create-test-ids2'}})
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/port.json');
  }
}

function setupRefreshPortMock(client, provider, servers, port) {
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
}

function setupPortModelCreateMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/ports',
      {port: {name: 'model created network'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/port.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/ports',
      {port: {name: 'model created network'}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/port.json');
  }
}

function setupGetPortMock(client, provider, servers, currentPort) {
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
}
