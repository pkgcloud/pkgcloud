/**
 * Created by Ali Bazlamit on 9/6/2017.
 */
var pkgcloud = require('pkgcloud'),
  _ = require('lodash');

// create our client with your 1&1 token
var client = pkgcloud.providers.oneandone.compute.createClient({
  token: process.env.OAO_TOKEN,
});

// This function will handle our server creation,
// as well as waiting for the server to come online after we've
// created it.
function handleServerResponse(err, server) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log('SERVER CREATED: ' + server.name + ', waiting for active status');

  // Wait for status: ACTIVE on our server, and then callback
  server.setWait({ status: server.STATUS.running }, 5000, function (err) {
    if (err) {
      console.dir(err);
      return;
    }

    console.log('SERVER INFO');
    console.log(server.name);
    console.log(server.status);
    console.log(server.id);

    console.log('Make sure you DELETE server: ' + server.id +
      ' in order to not accrue billing charges');
  });
}

// first we're going to get our flavors
client.getFlavors(function (err, flavors) {
  if (err) {
    console.dir(err);
    return;
  }

  // then get our base images
  client.getImages(function (err, images) {
    if (err) {
      console.dir(err);
      return;
    }

    // Pick a medium instance flavor
    var flavor = _.findWhere(flavors, { name: 'M' });

    // Pick an image based on Ubuntu 14.04
    var image = _.findWhere(images, { name: 'centos6-32std' });

    // Create our first server
    client.createServer({
      name: 'server1',
      image: image,
      flavor: flavor.id
    }, handleServerResponse);

    // Create our second server
    client.createServer({
      name: 'server2',
      image: image,
      flavor: flavor.id
    }, handleServerResponse);
  });
});
