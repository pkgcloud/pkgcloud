/**
 * Created by Ali Bazlamit on 8/30/2017.
 */
var server,
  _loadBalancer,
  lbClint,
  client;
var should = require('should'),
  helpers = require('../../helpers'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK,
  oneandone = require('liboneandone-2'),
  LoadBalancer = require('../../../lib/pkgcloud/oneandone/loadbalancer/loadbalancer').LoadBalancer,
  Node = require('../../../lib/pkgcloud/oneandone/loadbalancer/node').Node;

var srvr_options = {
  name: 'create-test-oao',
  flavor: '81504C620D98BCEBAA5202D145203B4B',
  image: '6631A1589A2CC87FEA9B99AB07399281',
  location: '4EFAD5836CE43ACA502FD5B99BEE44EF',
  token: process.env.OAO_TOKEN
};

describe('LoadBalancer tests', function () {
  this.timeout(18000000);
  var hockInstance, mockServer;

  before(function (done) {
    client = helpers.createClient('oneandone', 'compute', srvr_options);
    lbClint = helpers.createClient('oneandone', 'loadbalancer', srvr_options);
    if (!mock) {

      client.createServer(srvr_options, function (err, srv1) {
        should.not.exist(err);
        should.exist(srv1);
        server = srv1;
        server.setWait({ status: server.STATUS.running }, 5000, function (err) {
          if (err) {
            console.dir(err);
            return;
          }
          var options = {
            name: 'lb test',
            healthCheckInterval: 40,
            Persistence: true,
            persistenceTime: 1200,
            method: oneandone.LoadBalancerMethod.ROUND_ROBIN,
            rules: [
              {
                protocol: 'TCP',
                port_balancer: 80,
                port_server: 80,
                source: '0.0.0.0'
              }
            ],
            location: '4EFAD5836CE43ACA502FD5B99BEE44EF'
          };
          lbClint.createLoadBalancer(options, function (err, loadbalancer) {
            should.not.exist(err);
            should.exist(loadbalancer);
            _loadBalancer = loadbalancer;
            hockInstance && hockInstance.done();
            done();
          });
        });
      });
    } else {
      hockInstance = hock.createHock({ throwOnUnmatched: false });
      hockInstance.filteringRequestBody(helpers.authFilter);
      mockServer = http.createServer(hockInstance.handler);
      mockServer.listen(12345, done);
    }
  });

  after(function (done) {
    if (hockInstance) {
      mockServer.close(function () {
        done();
      });
    }
    else {
      server.setWait({ status: server.STATUS.running }, 5000, function (err) {
        if (err) {
          console.dir(err);
          return;
        }
        lbClint.deleteLoadBalancer(_loadBalancer, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          server.setWait({ status: server.STATUS.running }, 15000, function (err) {
            if (err) {
              console.dir(err);
              return;
            }
            client.destroyServer(server, function (err, response) {
              should.not.exist(err);
              should.exist(response);
              done();
            });
          });
        });
      });
    }
  });

  it('the getLoadBalancers() method should return a list of loadbalancers', function (done) {
    if (mock) {
      hockInstance
        .get('/load_balancers/{load_balancer_id}')
        .reply(200, helpers.loadFixture('oneandone/loadbalancers.json'));
    }
    server.setWait({ status: server.STATUS.running }, 5000, function (err) {
      if (err) {
        console.dir(err);
        return;
      }
      lbClint.getLoadBalancers(server, function (err, loadbalancers) {
        should.not.exist(err);
        should.exist(loadbalancers);

        loadbalancers.should.be.an.Array;

        loadbalancers.forEach(function (lb) {
          lb.should.be.instanceOf(LoadBalancer);
        });
        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  it('the updateLoadBalancer() method should update a loadbalancer ', function (done) {
    if (mock) {
      hockInstance
        .get('/load_balancers/{load_balancer_id}')
        .reply(202, helpers.loadFixture('oneandone/createLoadBalancer.json'));
    }
    var updateops = {};
    updateops.name = 'update oao';
    updateops.healthCheckInterval = 100;
    updateops.healthCheckPath = 'path';
    updateops.healthCheckParser = 100;
    updateops.Persistence = true;
    updateops.persistenceTime = 1000;
    updateops.method = oneandone.LoadBalancerMethod.ROUND_ROBIN;
    updateops.loadbalancer = _loadBalancer;
    server.setWait({ status: server.STATUS.running }, 5000, function (err) {
      if (err) {
        console.dir(err);
        return;
      }
      lbClint.updateLoadBalancer(updateops, function (err, response) {
        should.not.exist(err);
        should.exist(response);
        response.should.be.instanceOf(LoadBalancer);
        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  it('the addNodes() method should add a server ip to the load balancer ', function (done) {
    if (mock) {
      hockInstance
        .get('/load_balancers/{load_balancer_id}/server_ips')
        .reply(202, helpers.loadFixture('oneandone/createLoadBalancer.json'));
    }
    var updateops = {};
    updateops.serverIps = [server.ips[0].id];
    updateops.loadbalancer = _loadBalancer;
    server.setWait({ status: server.STATUS.running }, 5000, function (err) {
      if (err) {
        console.dir(err);
        return;
      }
      lbClint.addNodes(updateops, function (err, response) {
        should.not.exist(err);
        should.exist(response);
        response.should.be.instanceOf(LoadBalancer);
        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  it('the getNodes() method should update a loadbalancer ', function (done) {
    if (mock) {
      hockInstance
        .get('/load_balancers/{load_balancer_id}/server_ips')
        .reply(202, helpers.loadFixture('oneandone/addNodes.json'));
    }

    lbClint.getNodes(_loadBalancer, function (err, nodes) {
      should.not.exist(err);
      should.exist(nodes);

      nodes.should.be.an.Array;

      nodes.forEach(function (nd) {
        nd.should.be.instanceOf(Node);
      });
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('the removeNode() method should update a loadbalancer ', function (done) {
    if (mock) {
      hockInstance
        .get('/load_balancers/{load_balancer_id}')
        .reply(202, helpers.loadFixture('oneandone/createLoadBalancer.json'));
    }
    var updateops = {};
    updateops.serverIp = server.ips[0].id;
    updateops.loadbalancer = _loadBalancer;
    server.setWait({ status: server.STATUS.running }, 5000, function (err) {
      if (err) {
        console.dir(err);
        return;
      }
      lbClint.removeNode(updateops, function (err, response) {
        should.not.exist(err);
        should.exist(response);
        response.should.be.instanceOf(LoadBalancer);
        hockInstance && hockInstance.done();
        done();
      });
    });
  });
});

