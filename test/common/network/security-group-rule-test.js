/*
 * security-group-rule-test.js: Test for Networking (Neutron)'s security group rules
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
    SecurityGroupRule = require('../../../lib/pkgcloud/core/network/securityGroupRule').SecurityGroupRule,
    mock = !!process.env.MOCK,
    urlJoin = require('url-join');

// Declaring variables for helper functions defined later
var setupSecurityGroupRulesMock, setupGetSecurityGroupRuleMock, setupCreateSecurityGroupRuleMock,
    setupSecurityGroupRuleModelCreateMock, setupRefreshSecurityGroupRuleMock,
    setupModelDestroyedSecurityGroupRuleMock, setupDestroySecurityGroupRuleMock;

providers.filter(function(provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function(provider) {

  describe('pkgcloud/common/network/security-group-rules [' + provider + ']', function() {

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

    it('the getSecurityGroupRules() function should return a list of security group rules', function(done) {

      if (mock) {
        setupSecurityGroupRulesMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getSecurityGroupRules(function (err, securityGroupRules) {
        should.not.exist(err);
        should.exist(securityGroupRules);

        context.securityGroupRules = securityGroupRules;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the getSecurityGroupRule() method should get a security group rule instance', function (done) {

      if (mock) {
        setupGetSecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        },context.securityGroupRules[0]);
      }

      client.getSecurityGroupRule(context.securityGroupRules[0].id, function (err, securityGroupRule) {
        should.not.exist(err);
        should.exist(securityGroupRule);
        securityGroupRule.should.be.an.instanceOf(SecurityGroupRule);
        securityGroupRule.should.have.property('id', context.securityGroupRules[0].id);
        context.currentSecurityGroupRule = securityGroupRule;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the createSecurityGroupRule() method should create a security group rule', function (done) {
      if (mock) {
        setupCreateSecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.createSecurityGroupRule({
        direction: 'ingress'
      }, function (err, securityGroupRule) {
        should.not.exist(err);
        should.exist(securityGroupRule);
        securityGroupRule.should.be.an.instanceOf(SecurityGroupRule);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the destroySecurityGroupRule() method should delete a security group rule', function (done) {
      if (mock) {
        setupDestroySecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSecurityGroupRule);
      }

      client.destroySecurityGroupRule(context.currentSecurityGroupRule, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the destroySecurityGroupRule() method should take an id, delete a security group rule', function (done) {
      if (mock) {
        setupDestroySecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, context.currentSecurityGroupRule);
      }

      client.destroySecurityGroupRule(context.currentSecurityGroupRule.id, function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('the securityGroupRule.create() method should create a security group rule', function (done) {
      if (mock) {
        setupSecurityGroupRuleModelCreateMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var securityGroupRule = new SecurityGroupRule(client);
      securityGroupRule.direction = 'ingress';
      securityGroupRule.create(function (err, createdSecurityGroupRule) {
        should.not.exist(err);
        should.exist(createdSecurityGroupRule);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the securityGroupRule.refresh() method should get a security group rule', function (done) {
      var securityGroupRule = new SecurityGroupRule(client);
      securityGroupRule.id = 'd32019d3-bc6e-4319-9c1d-6722fc136a22';

      if (mock) {
        setupRefreshSecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, securityGroupRule);
      }

      securityGroupRule.refresh(function (err, refreshedSecurityGroupRule) {
        should.not.exist(err);
        should.exist(refreshedSecurityGroupRule);
        refreshedSecurityGroupRule.should.have.property('direction', 'ingress');
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the securityGroupRule.destroy() method should delete a security group rule', function (done) {
      var securityGroupRule = new SecurityGroupRule(client);
      securityGroupRule.name = 'model deleted securityGroupRule';
      securityGroupRule.id = 'THISISASECURITYGROUPRULEID';

      if (mock) {
        setupModelDestroyedSecurityGroupRuleMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        }, securityGroupRule);
      }

      securityGroupRule.destroy(function (err) {
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

setupSecurityGroupRulesMock = function (client, provider, servers) {
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
      .get('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRules.json');
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
        .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRules.json');
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
        .get('/v2.0/security-group-rules')
        .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroupRules.json');
  }
};

setupCreateSecurityGroupRuleMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/securityGroupRule.json');
  }
};

setupRefreshSecurityGroupRuleMock = function (client, provider, servers, securityGroupRule) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', securityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', securityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/security-group-rules', securityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroupRule.json');
  }
};

setupSecurityGroupRuleModelCreateMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'hp') {
    servers.server
      .post('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .post('/v2.0/security-group-rules', {
        security_group_rule: {
          direction: 'ingress'
        }
      })
      .replyWithFile(201, __dirname + '/../../fixtures/rackspace/securityGroupRule.json');
  }
};

setupGetSecurityGroupRuleMock = function (client, provider, servers, currentSecurityGroupRule) {
  if (provider === 'openstack') {
    servers.server
      .get(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/securityGroupRule.json');
  }
  else if (provider === 'rackspace') {
    servers.server
      .get(urlJoin('/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/securityGroupRule.json');
  }
};

setupDestroySecurityGroupRuleMock = function (client, provider, servers, currentSecurityGroupRule){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
};

setupModelDestroyedSecurityGroupRuleMock = function (client, provider, servers, currentSecurityGroupRule){
  if (provider === 'openstack') {
    servers.server
      .delete(urlJoin('/v2/72e90ecb69c44d0296072ea39e537041/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
  else if (provider === 'hp') {
    servers.server
      .delete(urlJoin('/v2/5ACED3DC3AA740ABAA41711243CC6949/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .delete(urlJoin('/v2.0/security-group-rules', currentSecurityGroupRule.id))
      .reply(204);
  }
};

