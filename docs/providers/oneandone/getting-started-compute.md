# Getting started with pkgcloud & Oneandone

The onandone node.js SDK is available as part of `pkgcloud`, a multi-provider cloud provisioning package.

To install `pkgcloud` from the command line:

```
npm install pkgcloud
```

Don't have `npm` or `node` yet? [Get it now](http://nodejs.org/download).

## Using pkgcloud

In this example, we're going to create a 1&1 compute client, create two servers, and then output their details to the command line.

*Note: We're going to use [lodash.js](https://lodash.com) for some convenience functions.*

```Javascript
var pkgcloud = require('pkgcloud'),
    _ = require('lodash');

// create our client with your 1&1 token
var client = pkgcloud.providers.oneandone.compute.createClient({
  token: 'api-key'
});

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

        // Pick a 512MB instance flavor
        var flavor = _.findWhere(flavors, { name: '512MB Standard Instance' });

        // Pick an image based on Ubuntu 14.04
        var image = _.findWhere(images, { name: 'Ubuntu 14.04' });

        // Create our first server
        client.createServer({
            name: 'server1',
            image: image,
            flavor: flavor.id,
	    location:location.id
        }, handleServerResponse);

        // Create our second server
        client.createServer({
            name: 'server2',
            image: image,
            flavor: flavor.id,
	    location:location.id,
        }, handleServerResponse);
    });
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
    server.setWait({ status: 'ACTIVE' }, 5000, function (err) {
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
```
