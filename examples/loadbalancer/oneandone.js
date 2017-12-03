/**
 * Created by Ali Bazlamit on 9/6/2017.
 */
var pkgcloud = require('pkgcloud'),
  _ = require('lodash');

(function () {

  var config = {
    token: process.env.OAO_TOKEN,
  };

  // create our client with your 1&1 credentials
  var computeClient = pkgcloud.providers.oneandone.compute.createClient(config);
  var loadBalancerClient = pkgcloud.providers.oneandone.loadbalancer.createClient(config);

  // first we're going to get our flavors
  computeClient.getFlavors(function (err, flavors) {
    if (err) {
      console.dir(err);
      return;
    }

    // then get our base images
    computeClient.getImages(function (err, images) {
      if (err) {
        console.dir(err);
        return;
      }

      // Pick a 512MB instance flavor
      var flavor = _.findWhere(flavors, { name: 'M' });

      // Pick an image based on Ubuntu 14.04
      var image = _.findWhere(images, { name: 'centos6-32std' });

      // Create our first server
      computeClient.createServer({
        name: 'server11',
        image: image,
        flavor: flavor.id,
        location: '4EFAD5836CE43ACA502FD5B99BEE44EF'
      }, function (err, server) {
        if (err) {
          console.error(err);
          return;
        }

        // Wait for our server to start up
        server.setWait({ status: server.STATUS.running }, 5000, function (err) {
          if (err) {
            console.dir(err);
            return;
          }

          // create a block storage snapshot
          var options = {
            name: 'lb test',
            healthCheckInterval: 40,
            Persistence: true,
            persistenceTime: 1200,
            method: 'ROUND_ROBIN',
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

          loadBalancerClient.createLoadBalancer(options, function (err, loadbalancer) {
            if (err) {
              console.error(err);
              return;
            }
            console.log(loadbalancer);
          });
        });
      });
    });
  });
})();
