/*
 * flavor-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var clients     = {},
    testContext = {},
    versions    = JSON.parse(helpers.loadFixture('versions.json'));

function batchOne (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getVersion() method": {
      "with no arguments": {
        topic: function () {
          client.getVersion(this.callback);
        },
        "should return the version": function (err, version) {
          assert.ok(typeof version === 'string');
          if (version !== versions[name]) {
            console.error(
              '!! API Version for ' + name + ' is ' + version + '.'+
              ' we were expecting it to be ' + versions[name]
            );
          }
        }
      }
    }
  };

  return test;
}

function batchTwo (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {},
      m      = process.env.NOCK ? 1 : 100;

  test["The pkgcloud " + name + " compute client"] = {
    "the setWait() method": {
      "on flavors waiting for flavor with name crazyflavah": {
        topic: function () {
          var self = this;
          client.getFlavors(function (err, flavors) {
            if (err) { return self.callback(err); }
            testContext.flavors = flavors;

            var flavor = flavors[0];
            var now    = Date.now();

            flavor.until({ name: 'crazyFlavah' }, 50*m, 50*m, function () {
              self.callback(null, Date.now() - now);
            });
          });
        },
        "should timeout": function (err, duration) {
          assert.ok(duration);
          assert.ok(duration > 50);
        }
      }
    }
  };

  return test;
}

function batchThree (providerClient, providerName, nock) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getImages() method": {
      "with no details": {
        topic: function () {
          client.getImages(this.callback);
        },
        "should return the list of images": function (err, images) {
          testContext.images = images;
          images.forEach(function (image) {
            assert.assertImage(image);
          });
          assert.assertNock(nock);
        }
      }
    }
  };

  return test;
}

function batchFour (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {},
      m      = process.env.NOCK ? 1 : 100;

  test["The pkgcloud " + name + " compute client"] = {
    "the setWait() method": {
      "waiting for a server to be operational": {
        topic: function () {
          var self = this;
          client.createServer({
            name: 'create-test-setWait',
            image: testContext.images[0].id,
            flavor: testContext.flavors[0].id
          }, function (err, server) {
            if (err) { return this.callback(err); }
            server.setWait({ status: 'RUNNING' }, 100*m, function (err, srv) {
              self.callback(null, srv);
            });
          });
        },
        "should a server in running state": function (err, server) {
          assert.isNull(err);
          assert.equal(server.name, 'create-test-setWait');
          assert.equal(server.status, 'RUNNING');
          assert.assertServerDetails(server);
        }
      }
    }
  };

  return test;
}

JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function (provider) {
    clients[provider] = helpers.createClient(provider, 'compute');
    var client = clients[provider],
        nock   = require('nock');

    if (process.env.NOCK) {
      if (provider === 'joyent') {
        nock('https://' + client.serversUrl)
          .get('/' + client.account + '/datacenters')
            .reply(200, "", { 'x-api-version': '6.5.0' })
          .get('/' + client.account + '/datasets')
            .reply(200, helpers.loadFixture('joyent/images.json'), {})
          .get('/' + client.account + '/packages')
            .reply(200, helpers.loadFixture('joyent/flavors.json'), {})
          .get('/' + client.account + '/packages/Small%201GB')
            .reply(200, helpers.loadFixture('joyent/flavor.json'), {})
          .post('/' + client.account + '/machines',
            "{\"name\":\"create-test-setWait\",\"package\":" +
            "\"Small 1GB\",\"dataset\":\"sdc:sdc:nodejitsu:1.0.0\"}")
            .reply(201, helpers.loadFixture('joyent/setWait.json'), {})
          .get('/' + client.account +
              '/machines/534aa63a-104f-4d6d-a3b1-c0d341a20a53')
            .reply(200, helpers.loadFixture('joyent/setWaitResp1.json'), {});
      } else if (provider === 'rackspace') {
        nock('https://' + client.authUrl)
          .get('/v1.0')
          .reply(204, "",
            JSON.parse(helpers.loadFixture('rackspace/auth.json')));
        nock('https://' + client.serversUrl)
          .get('/')
            .reply(200,
              "{\"versions\":[{\"id\":\"v1.0\",\"status\":\"BETA\"}]}", {})
          .get('/v1.0/537645/images/detail.json')
            .reply(200, helpers.loadFixture('rackspace/images.json'), {})
          .get('/v1.0/537645/flavors/detail.json')
            .reply(200, helpers.loadFixture('rackspace/flavors.json'), {})
          .get('/v1.0/537645/flavors/1')
            .reply(200, helpers.loadFixture('rackspace/flavor.json'), {})
        .post('/v1.0/537645/servers',
            helpers.loadFixture('rackspace/setWait.json'))
          .reply(202, helpers.loadFixture('rackspace/setWaitResp1.json'), {})
        .post('/v1.0/537645/servers',
            helpers.loadFixture('rackspace/setWait.json'))
          .reply(202, helpers.loadFixture('rackspace/setWaitResp2.json'), {})
        .get('/v1.0/537645/servers/20602046')
          .reply(200, helpers.loadFixture('rackspace/20602046.json'), {});
      } else if (provider === 'amazon') {
        nock('https://' + client.serversUrl)
          .filteringRequestBody(helpers.authFilter)
          .post('/?Action=DescribeImages', { 'Owner.1': 'self' })
            .reply(200, helpers.loadFixture('amazon/images.xml'), {})
          .post('/?Action=RunInstances', {
            'ImageId': 'ami-85db1cec',
            'InstanceType': 'm1.small',
            'MaxCount': '1',
            'MinCount': '1',
            'UserData': 'eyJuYW1lIjoiY3JlYXRlLXRlc3Qtc2V0V2FpdCJ9'
          })
            .reply(200, helpers.loadFixture('amazon/run-instances.xml'), {})
          .post('/?Action=DescribeInstances', {
            'Filter.1.Name': 'instance-state-code',
            'Filter.1.Value.1': '0',
            'Filter.1.Value.2': '16',
            'Filter.1.Value.3': '32',
            'Filter.1.Value.4': '64',
            'Filter.1.Value.5': '80',
            'InstanceId.1': 'i-1d48637b'
          })
            .reply(200, helpers.loadFixture('amazon/pending-server.xml'), {})
          .post('/?Action=DescribeInstanceAttribute', {
            'Attribute': 'userData',
            'InstanceId': 'i-1d48637b'
          })
            .reply(200,
                   helpers.loadFixture('amazon/running-server-attr.xml', {}))
          .post('/?Action=DescribeInstances', {
            'Filter.1.Name': 'instance-state-code',
            'Filter.1.Value.1': '0',
            'Filter.1.Value.2': '16',
            'Filter.1.Value.3': '32',
            'Filter.1.Value.4': '64',
            'Filter.1.Value.5': '80',
            'InstanceId.1': 'i-1d48637b'
          })
            .reply(200, helpers.loadFixture('amazon/running-server.xml'), {})
          .post('/?Action=DescribeInstanceAttribute', {
            'Attribute': 'userData',
            'InstanceId': 'i-1d48637b'
          })
            .reply(200,
                   helpers.loadFixture('amazon/running-server-attr.xml', {}));
      }
    }

    vows
      .describe('pkgcloud/common/compute/flavor [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider, nock))
      .addBatch(batchTwo(clients[provider], provider, nock))
      .addBatch(batchThree(clients[provider], provider, nock))
      .addBatch(batchFour(clients[provider], provider, nock))
       ["export"](module);
  });
