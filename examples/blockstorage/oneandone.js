/**
 * Created by Ali Bazlamit on 9/6/2017.
 */
var pkgcloud = require('pkgcloud'),
  _ = require('lodash');

(function() {

  var config = {
    token: process.env.OAO_TOKEN,
  };

  // create our client with your 1&1 credentials
  var computeClient = pkgcloud.providers.oneandone.compute.createClient(config);
  var blockStorageClient = pkgcloud.providers.oneandone.blockstorage.createClient(config);

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

      // Pick a medium instance flavor
      var flavor = _.findWhere(flavors, { name: 'M' });

      // Pick an image based on Ubuntu 14.04
      var image = _.findWhere(images, { name: 'centos6-32std' });

      // Create our first server
      computeClient.createServer({
        name: 'server1',
        image: image,
        flavor: flavor.id
      }, function(err, server) {
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
          blockStorageClient.createSnapshot(server, function(err, snapshot) {
            if (err) {
              console.error(err);
              return;
            }
            console.log(snapshot);
          });
        });
      });
    });
  });
})();
