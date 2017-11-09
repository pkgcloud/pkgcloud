## Using the 1&1 Compute provider

As of the `v0.8` release of `pkgcloud`, the Compute provider uses Next Generation Cloud Servers, meaning you'll need to use a version <=0.7.x to use First Generation Cloud Servers.

Creating a client is straight-forward:

``` js
  var oneandone = pkgcloud.compute.createClient({
    provider: 'oneandone', // required
    token: 'your-api-key', // required
  });
```

[More options for creating clients](README.md)

### API Methods

**Servers**

#### client.getServers(callback)
Lists all servers available to your account.

Callback returns `f(err, servers)` where `servers` is an `Array`

#### client.createServer(options, callback)
Creates a server with the options specified

Options are as follows:

```js
{
  name: 'server name',
  flavor: 'falvor-id',
  image: 'image or imageId',
  location: 'datacenter id'
}

```
Returns the server in the callback `f(err, server)`

#### client.destroyServer(server, callback)
Destroys the specified server

Takes server or serverId as an argument  and returns the id of the destroyed server in the callback `f(err, serverId)`

#### client.getServer(server, callback)
Gets specified server

Takes server or serverId as an argument and returns the server in the callback
`f(err, server)`

#### client.rebootServer(server, options, callback)
Reboots the specifed server with options

Returns callback with a confirmation

#### client.getVersion(callback)

Get the current version of the api returned in a callback `f(err, version)`

**flavors**

#### client.getFlavors(callback)

Returns available flavours for fixed servers in the callback `f(err,
flavors)`

#### client.getFlavor(flavor, callback)
Returns information about one flavour in the callback `f(err, flavor)`

**images**

#### client.getImages(callback)
Lists all images available to your account

`f(err, images)`

#### client.getImage(image, callback)
Information about specific appliance/image

`f(err, image)`

#### client.createImage(options, callback)
Adds a new image from a server	

Options include:

```js
{
  name: 'image name',
  server: 'server or server id'
}
```

Returns the newly created image

`f(err, image)`

#### client.destroyImage(image, callback)
Destroys the specified image and returns a confirmation

`f(err, {ok: imageId})`