
* [Server](#server)
* [Image](#image)
* [Flavor](#flavor)

<a name="server"></a>
#### Server
* `client.getServers(function (err, servers) { })`
* `client.createServer(options, function (err, server) { })`
* `client.destroyServer(serverId, function (err, server) { })`
* `client.getServer(serverId, function (err, server) { })`
* `client.rebootServer(server, function (err, server) { })`

<a name="image"></a>
#### Image
* `client.getImages(function (err, images) { })`
* `client.getImage(imageId, function (err, image) { })`
* `client.destroyImage(image, function (err, ok) { })`
* `client.createImage(options, function (err, image) { })`

<a name="flavor"></a>
#### Flavor
* `client.getFlavors(function (err, flavors) { })`
* `client.getFlavor(flavorId, function (err, flavor) { })`
