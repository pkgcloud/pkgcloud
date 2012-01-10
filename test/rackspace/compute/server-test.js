/*
 * server-test.js: Tests for pkgcloud Rackspace compute server requests
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {};
    testContext = {},
    client = helpers.createClient('rackspace', 'compute');

function findImage(name) {
  for (var i = 0; i < testContext.images.length; i++) {
    if (testContext.images[i].name === name) {
      return testContext.images[i];
    }
  }
}

function findFlavor(name) {
  for (var i = 0; i < testContext.flavors.length; i++) {
    if (testContext.flavors[i].name === name) {
      return testContext.flavors[i];
    }
  }
}

vows.describe('pkgcloud/rackspace/compute/servers').addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getImages() method": {
      "with details": {
        topic: function () {
          client.getImages(true, this.callback);
        },
        "should return the list of images": function (err, images) {
          assert.isNull(err);
          testContext.images = images;
          images.forEach(function (image) {
            assert.assertImageDetails(image);
          });
        }
      }
    },
    "the getFlavors() method": {
      "with details": {
        topic: function () {
          client.getFlavors(true, this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          assert.isNull(err);
          testContext.flavors = flavors;
          flavors.forEach(function (flavor) {
            assert.assertFlavorDetails(flavor);
          });
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the create() method": {
      "with image and flavor ids": {
        topic: function () {
          client.createServer({
            name: 'create-test-ids',
            image: 49, // Ubuntu Lucid
            flavor: 1, // 256 server
          }, this.callback);
        },
        "should return a valid server": function (err, server) {
          assert.isNull(err);
          assert.assertServerDetails(server);
        }
      },
      "with image and flavor ids a second time": {
        topic: function () {
          client.createServer({
            name: 'create-test-ids2',
            image: 49, // Ubuntu Lucid
            flavor: 1, // 256 server
          }, this.callback);
        },
        "should return a valid server": function (err, server) {
          assert.isNull(err);
          assert.assertServerDetails(server);
        }
      },
      "with image and flavor instances": {
        topic: function () {
          var image = findImage('Ubuntu 10.04 LTS'),
              flavor = findFlavor('256 server');

          client.createServer({
            name: 'create-test-objects',
            image: image,
            flavor: flavor,
          }, this.callback);
        },
        "should return a valid server": function (err, server) {
          assert.isNull(err);
          assert.assertServerDetails(server);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getServers() method": {
      topic: function () {
        client.getServers(this.callback);
      },
      "should return the list of servers": function (err, servers) {
        assert.isNull(err);
        testContext.servers = servers;
        servers.forEach(function (server) {
          assert.assertServer(server);
        });
      }
    },
    "the getServerDetails() method": {
      topic: function () {
        client.getServerDetails(this.callback);
      },
      "should return the list of servers": function (err, servers) {
        assert.isNull(err);
        servers.forEach(function (server) {
          assert.assertServerDetails(server);
        });
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getServer() method": {
      topic: function () {
        client.getServer(testContext.servers[0].id, this.callback);
      },
      "should return a valid server": function (err, server) {
        assert.isNull(err);
        assert.assertServerDetails(server);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "an instance of a Server": {
      "the getAddresses() method": {
        "when requesting all addresses": {
          topic: function () {
            this.server0 = testContext.servers[0];
            this.server0.getAddresses(this.callback);
          },
          "should return all valid addresses": function (err, addresses) {
            assert.isNull(err);
            assert.include(addresses, 'public');
            assert.include(addresses, 'private');
            assert.include(this.server0.addresses, 'public');
            assert.include(this.server0.addresses, 'private');
          }
        },
        "when requesting public addresses": {
          topic: function (server) {
            this.server1 = testContext.servers[1];
            this.server1.getAddresses('public', this.callback);
          },
          "should return all valid addresses": function (err, addresses) {
            assert.isNull(err);
            assert.include(addresses, 'public');
            assert.isUndefined(addresses.private);
            assert.include(this.server1.addresses, 'public');
            assert.isUndefined(this.server1.addresses.private);
          }
        },
        "when requesting private addresses": {
          topic: function (server) {
            this.server2 = testContext.servers[2];
            this.server2.getAddresses('private', this.callback);
          },
          "should return all valid addresses": function (err, addresses) {
            assert.isNull(err);
            assert.include(addresses, 'private');
            assert.isUndefined(addresses.public);
            assert.include(this.server2.addresses, 'private');
            assert.isUndefined(this.server2.addresses.public);
          }
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "an instance of a Server": {
      "the getBackup() method": {
        topic: function () {
          this.server0 = testContext.servers[0];
          this.server0.getBackup(this.callback);
        },
        "should return a valid backup schedule": function (err, backup) {
          assert.isNull(err);
          assert.isNotNull(backup);
          assert.include(backup, 'enabled');
          assert.include(backup, 'weekly');
          assert.include(backup, 'daily');
        }
      },
      "the disableBackup() method": {
        topic: function () {
          var that2 = this;
          that2.server = testContext.servers[1];
          that2.server.setWait({ status: 'ACTIVE' }, 5000, function () {
            that2.server.disableBackup(that2.callback);
          });
        },
        "should respond with 204": function (err, res) {
          assert.isNull(err);
          assert.equal(res.statusCode, 204);
        }
      },
      "the updateBackup() method": {
        topic: function () {
          var backup = {
            "enabled": true,
            "weekly": "THURSDAY",
            "daily": "H_0400_0600"
          };

          var that3 = this;
          that3.server = testContext.servers[2];
          that3.server.setWait({ status: 'ACTIVE' }, 5000, function () {
            that3.server.updateBackup(backup, that3.callback);
          });
        },
        "should respond with 202": function (err, res) {
          assert.isNull(err);
          assert.equal(res.statusCode, 202);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "with an instance of a Server": {
      "the reboot() method": {
        topic: function () {
          var that = this;
          testContext.servers[0].setWait({ status: 'ACTIVE' }, 5000, function () {
            testContext.servers[0].reboot(that.callback);
          });
        },
        "should respond with 202": function (err, res) {
          assert.isNull(err);
          assert.equal(res.statusCode, 202);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "with an instance of a Server": {
      "the destroy() method with the first server": {
        topic: function () {
          var that1 = this;
          testContext.servers[0].setWait({ status: 'ACTIVE' }, 5000, function () {
            testContext.servers[0].destroy(that1.callback);
          });
        },
        "should respond with 202": function (err, res) {
          assert.isNull(err);
          assert.equal(res.statusCode, 202);
        }
      },
      "the destroy() method with the second server": {
        topic: function () {
          var that2 = this;
          that2.server = testContext.servers[1];
          that2.server.setWait({ status: 'ACTIVE' }, 5000, function () {
            that2.server.destroy(that2.callback);
          });
        },
        "should respond with 202": function (err, res) {
          assert.isNull(err);
          assert.equal(res.statusCode, 202);
        }
      },
      "the destroy() method with the third server": {
        topic: function () {
          var that3 = this;
          that3.server = testContext.servers[2];
          that3.server.setWait({ status: 'ACTIVE' }, 5000, function () {
            that3.server.destroy(that3.callback);
          });
        },
        "should respond with 202": function (err, res) {
          assert.isNull(err);
          assert.isNull(err);
          if (!err) {
            assert.equal(res.statusCode, 202);
          }
        }
      }
    }
  }
}).export(module);
