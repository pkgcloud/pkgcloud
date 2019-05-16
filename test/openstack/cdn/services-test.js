/*
 * services-test.js: Unit tests for the CDN services resource
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var helpers = require('../../helpers'),
    mock = !!process.env.MOCK,
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    should = require('should'),
    Service = require('../../../lib/pkgcloud/openstack/cdn/service').Service;

// Declaring variables for helper functions defined later
var setupCreateServiceMock, setupGetServicesMock, setupGetServiceMock,
  setupUpdateServiceMock, setupDeleteServiceMock,
  setupDeleteServiceAllCachedAssetsMock, setupDeleteServiceCachedAssetMock;

describe('pkgcloud/openstack/cdn/services', function() {

  // Create CDN service client
  var client = helpers.createClient('openstack', 'cdn'),
    context = {},
    authHockInstance, hockInstance,
    authServer, server;

  // Runs before all unit tests are run
  before(function (done) {

    if (!mock) {
      return done();
    }

    // Spin up an authentication server as well as a CDN service server
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

  // Runs after all unit tests have run
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

  // Unit tests follow...

  it('the client.createService() method should create a service', function(done) {

    if (mock) {
      setupCreateServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.createService({
      name: 'pkgcloud-site',
      domains: [
        {
          domain: 'pkgcloud.com'
        },
        {
          domain: 'www.pkgcloud.com'
        }
      ],
      origins: [
        {
          origin: 'origin.pkgcloud.com'
        }
      ],
      flavorId: 'cdn'
    }, function (err, service) {
      should.not.exist(err);
      should.exist(service);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.getServices() method should return a list of services', function(done) {

    if (mock) {
      setupGetServicesMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.getServices(function (err, services) {
      should.not.exist(err);
      should.exist(services);

      context.services = services;

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.getService() method should return a service instance', function(done) {

    if (mock) {
      setupGetServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.getService(context.services[0], function (err, service) {
      should.not.exist(err);
      should.exist(service);
      service.should.be.an.instanceOf(Service);
      service.should.have.property('name', context.services[0].name);

      context.currentService = service;

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.getService() method should take an id, return a service instance', function(done) {

    if (mock) {
      setupGetServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.getService(context.services[0].id, function (err, service) {
      should.not.exist(err);
      should.exist(service);
      service.should.be.an.instanceOf(Service);
      service.should.have.property('name', context.services[0].name);

      context.currentService = service;

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.updateService() method should update a service', function(done) {

    var serviceToUpdate = context.currentService;
    serviceToUpdate.origins[0].origin = 'updated-origin.pkgcloud.com';

    if (mock) {
      setupUpdateServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.updateService(serviceToUpdate, function (err, service) {
      should.not.exist(err);
      should.exist(service);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.deleteService() method should delete a service', function(done) {
    if (mock) {
      setupDeleteServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.deleteService(context.currentService, function (err) {
      should.not.exist(err);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.deleteService() method should take an id, delete a service', function(done) {
    if (mock) {
      setupDeleteServiceMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.deleteService(context.currentService.id, function (err) {
      should.not.exist(err);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.deleteServiceCachedAssets() method should delete all cached assets of a service', function(done) {
    if (mock) {
      setupDeleteServiceAllCachedAssetsMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.deleteServiceCachedAssets(context.currentService, function (err) {
      should.not.exist(err);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.deleteServiceCachedAssets() method should take an asset URL, delete that cached asset of a service', function(done) {
    if (mock) {
      setupDeleteServiceCachedAssetMock(client,  {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.deleteServiceCachedAssets(context.currentService, '/images/logo.png', function (err) {
      should.not.exist(err);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

});

setupCreateServiceMock = function (client, servers) {
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
    .post('/v1.0/72e90ecb69c44d0296072ea39e537041/services', {
      name: 'pkgcloud-site',
      domains: [
        {
          domain: 'pkgcloud.com'
        },
        {
          domain: 'www.pkgcloud.com'
        }
      ],
      origins: [
        {
          origin: 'origin.pkgcloud.com'
        }
      ],
      flavor_id: 'cdn'
    })
    .reply(202, null, { Location: 'http://localhost:12345/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66' })
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66')
    .replyWithFile(200, __dirname + '/../../fixtures/openstack/cdnService.json');
};

setupGetServicesMock = function (client, servers) {
  servers.server
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/services')
    .replyWithFile(200, __dirname + '/../../fixtures/openstack/cdnServices.json');
};

setupGetServiceMock = function (client, servers) {
  servers.server
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66')
    .replyWithFile(200, __dirname + '/../../fixtures/openstack/cdnService.json');
};

setupUpdateServiceMock = function (client, servers) {
  servers.server
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66')
    .replyWithFile(200, __dirname + '/../../fixtures/openstack/cdnService.json')    
    .patch('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66', [
      {
        op: 'replace',
        path: '/origins/0/origin',
        value: 'updated-origin.pkgcloud.com'
      },
      { op: 'remove', path: '/client' },
      { op: 'remove', path: '/listenerTree' },
      { op: 'remove', path: '/wildcard' },
      { op: 'remove', path: '/_maxListeners' },
      { op: 'remove', path: '/delimiter' },
      { op: 'remove', path: '/_conf' },
      { op: 'remove', path: '/verboseMemoryLeak' },
      { op: 'remove', path: '/_removeListener' },
      { op: 'remove', path: '/_newListener' },
      { op: 'remove', path: '/_events' }
    ])
    .reply(202);
};

setupDeleteServiceMock = function (client, servers) {
  servers.server
    .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66')
    .reply(202);
};

setupDeleteServiceAllCachedAssetsMock = function (client, servers) {
  servers.server
    .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66/assets?all=true')
    .reply(202);
};

setupDeleteServiceCachedAssetMock = function (client, servers) {
  servers.server
    .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/services/d49cd860-911f-11e4-b4a9-0800200c9a66/assets?url=%2Fimages%2Flogo.png')
    .reply(202);
};
