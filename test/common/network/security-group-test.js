/*
 * security-group-test.js: Test for Networking (Neutron)'s security groups
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var helpers = require('../../helpers');

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    providers = require('../../configs/providers.json'),
    SecurityGroup = require('../../../lib/pkgcloud/core/network/securityGroup').SecurityGroup,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

// Declaring variables for helper functions defined later
var setupSecurityGroupsMock, setupGetSecurityGroupMock, setupCreateSecurityGroupMock,
    setupSecurityGroupModelCreateMock, setupRefreshSecurityGroupMock,
    setupModelDestroyedSecurityGroupMock, setupDestroySecurityGroupMock;

providers.filter(function(provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function(provider) {

  describe('pkgcloud/common/network/security-groups [' + provider + ']', function() {

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

    it('the getSecurityGroups() function should return a list of security groups', function(done) {

      if (mock) {
        setupSecurityGroupsMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getSecurityGroups(function (err, securityGroups) {
        should.not.exist(err);
        should.exist(securityGroups);

        context.securityGroups = securityGroups;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getSecurityGroup() method should get a security group instance', function (done) {

      if (mock) {
        setupGetSecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        },context.securityGroups[0]);
      }

      client.getSecurityGroup(context.securityGroups[0].id, function (err, securityGroup) {
        should.not.exist(err);
        should.exist(securityGroup);
        securityGroup.should.be.an.instanceOf(SecurityGroup);
        securityGroup.should.have.property('id', context.securityGroups[0].id);
        context.currentSecurityGroup = securityGroup;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the createSecurityGroup() method should create a security group', function (done) {
      if (mock) {
        setupCreateSecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createSecurityGroup({
        name: 'create-test-ids2'
      }, function (err, securityGroup) {
        should.not.exist(err);
        should.exist(securityGroup);
        securityGroup.should.be.an.instanceOf(SecurityGroup);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the destroySecurityGroup() method should delete a security group', function (done) {
      if (mock) {
        setupDestroySecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSecurityGroup);
      }

      client.destroySecurityGroup(context.currentSecurityGroup, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the destroySecurityGroup() method should take an id, delete a security group', function (done) {
      if (mock) {
        setupDestroySecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSecurityGroup);
      }

      client.destroySecurityGroup(context.currentSecurityGroup.id, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the securityGroup.create() method should create a security group', function (done) {
      if (mock) {
        setupSecurityGroupModelCreateMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var securityGroup = new SecurityGroup(client);
      securityGroup.name= 'model created security group';
      securityGroup.create(function (err, createdSecurityGroup) {
        should.not.exist(err);
        should.exist(createdSecurityGroup);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the securityGroup.refresh() method should get a security group', function (done) {
      var securityGroup = new SecurityGroup(client);
      securityGroup.id = 'd32019d3-bc6e-4319-9c1d-6722fc136a22';

      if (mock) {
        setupRefreshSecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, securityGroup);
      }

      securityGroup.refresh(function (err, refreshedSecurityGroup) {
        should.not.exist(err);
        should.exist(refreshedSecurityGroup);
        refreshedSecurityGroup.should.have.property('name', 'default');
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the securityGroup.destroy() method should delete a security group', function (done) {
      var securityGroup = new SecurityGroup(client);
      securityGroup.name = 'model deleted securityGroup';
      securityGroup.id = 'THISISASECURITYGROUPID';

      if (mock) {
        setupModelDestroyedSecurityGroupMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, securityGroup);
      }

      securityGroup.destroy(function (err) {
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

setupSecurityGroupsMock = function (client, provider, servers) {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroups.json');
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
        .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroups.json');
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
        .get('/v2.0/security-groups')
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroups.json');
  }
};

setupCreateSecurityGroupMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', {
        security_group: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', {
        security_group: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/security-groups', {
        security_group: {
          name: 'create-test-ids2'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/securityGroup.json');
  }
};

setupRefreshSecurityGroupMock = function (client, provider, servers, securityGroup) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', securityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', securityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/security-groups', securityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroup.json');
  }
};

setupSecurityGroupModelCreateMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', {
        security_group: {
          name: 'model created security group'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', {
        security_group: {
          name: 'model created security group'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/security-groups', {
        security_group: {
          name: 'model created security group'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/securityGroup.json');
  }
};

setupGetSecurityGroupMock = function (client, provider, servers, currentSecurityGroup) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', currentSecurityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', currentSecurityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroup.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/security-groups', currentSecurityGroup.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroup.json');
  }
};

setupDestroySecurityGroupMock = function (client, provider, servers, currentSecurityGroup){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
};

setupModelDestroyedSecurityGroupMock = function (client, provider, servers, currentSecurityGroup){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/security-groups', currentSecurityGroup.id))
      .reply(204);
  }
};

