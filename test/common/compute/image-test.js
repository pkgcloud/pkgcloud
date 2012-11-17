/*
 * image-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs          = require('fs'),
  path        = require('path'),
  vows        = require('vows'),
  assert      = require('../../helpers/assert'),
  helpers     = require('../../helpers'),
  testData    = {},
  testContext = {},
  clients     = {};

function batchOne (providerClient, providerName, nock) {
  var name   = providerName   || 'rackspace',
    client = providerClient || rackspace,
    test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getServers() method": {
      "with no details": {
        topic: function () {
          client.getServers(this.callback);
        },
        "should return the list of servers": function (err, servers) {
          testContext.servers = servers;
          servers.forEach(function (server) {
            assert.assertServer(server);
          });
          assert.assertNock(nock);
        }
      }
    }
  };

  return test;
}

function batchTwo (providerClient, providerName, nock) {
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

function batchThree (providerClient, providerName, nock) {
  var name   = providerName   || 'rackspace',
    client = providerClient || rackspace,
    test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getImage() method providing an id": {
      topic: function () {
        client.getImage(testContext.images[0].id, this.callback);
      },
      "should return a valid image": function (err, image) {
        assert.assertImageDetails(image);
        assert.assertNock(nock);
      }
    },
    "the getImage() method providing an image": {
      topic: function () {
        client.getImage(testContext.images[0], this.callback);
      },
      "should return a valid image": function (err, image) {
        assert.assertImageDetails(image);
        assert.assertNock(nock);
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
          .get('/' + client.account + '/machines')
          .reply(200, "[]", {})
          .get('/' + client.account + '/datasets')
          .reply(200, helpers.loadFixture('joyent/images.json'), {})
          .get('/' + client.account +
          '/datasets/sdc%3Asdc%3Anodejitsu%3A1.0.0')
          .reply(200, helpers.loadFixture('joyent/image.json'), {})
          .get('/' + client.account +
          '/datasets/sdc%3Asdc%3Anodejitsu%3A1.0.0')
          .reply(200, helpers.loadFixture('joyent/image.json'), {});
      } else if (provider === 'rackspace') {
        nock('https://' + client.authUrl)
          .get('/v1.0')
          .reply(204, "",
          JSON.parse(helpers.loadFixture('rackspace/auth.json')));
        nock('https://' + client.serversUrl)
          .get('/v1.0/537645/servers/detail.json')
          .reply(204, helpers.loadFixture('rackspace/servers.json'), {})
          .get('/v1.0/537645/images/detail.json')
          .reply(200, helpers.loadFixture('rackspace/images.json'), {})
          .get('/v1.0/537645/images/112')
          .reply(200, helpers.loadFixture('rackspace/image.json'), {})
          .get('/v1.0/537645/images/112')
          .reply(200, helpers.loadFixture('rackspace/image.json'), {});
      } else if (provider === 'amazon') {
        nock('https://' + client.serversUrl)
          .filteringRequestBody(helpers.authFilter)
          .post('/?Action=DescribeInstances', {})
          .reply(200, helpers.loadFixture('amazon/running-server.xml'), {})
          .post('/?Action=DescribeInstanceAttribute', {
            'Attribute': 'userData',
            'InstanceId': 'i-1d48637b'
          })
          .reply(200,
          helpers.loadFixture('amazon/running-server-attr.xml', {}))
          .post('/?Action=DescribeImages', { 'Owner.0': 'self' })
          .reply(200, helpers.loadFixture('amazon/images.xml'), {})
          .post('/?Action=DescribeImages', { 'ImageId.1': 'ami-85db1cec' })
          .reply(200, helpers.loadFixture('amazon/image-1.xml'), {})
          .post('/?Action=DescribeImages', { 'ImageId.1': 'ami-85db1cec' })
          .reply(200, helpers.loadFixture('amazon/image-1.xml'), {})
      } else if (provider === 'azure') {
        nock('https://' + client.serversUrl)
          .get('/azure-account-subscription-id/services/images')
          .reply(200,helpers.loadFixture('azure/images.xml'),{})
          .get('/azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
          .reply(200,helpers.loadFixture('azure/image-1.xml'),{})
          .get('/azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
          .reply(200,helpers.loadFixture('azure/image-1.xml'),{})
          .get('/azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
          .reply(200,helpers.loadFixture('azure/image-1.xml'),{})
          .get('/azure-account-subscription-id/services/hostedservices')
          .reply(200, "<HostedServices xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>", {})
          .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
          .reply(200, "<HostedServices xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>", {});
      };
    }

    vows
      .describe('pkgcloud/common/compute/image [' + provider + ']')
      .addBatch(batchOne(client, provider, nock))
      .addBatch(batchTwo(client, provider, nock))
      .addBatch(batchThree(client, provider, nock))
      ["export"](module);
  });
