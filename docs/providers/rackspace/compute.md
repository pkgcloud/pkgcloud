##Using the Rackspace Compute provider

As of the `v0.8` release of `pkgcloud`, the Compute provider uses Next Generation Cloud Servers, meaning you'll need to use a version <=0.7.x to use First Generation Cloud Servers.

Creating a client is straight-forward:

``` js
  var rackspace = pkgcloud.compute.createClient({
    provider: 'rackspace', // required
    username: 'your-user-name', // required
    apiKey: 'your-api-key', // required
    region: 'IAD', // required, regions can be found at
    // http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });
```

[More options for creating clients](README.md)

### API Methods

**Servers**

#### client.getServers(callback)
Lists all servers that are available to use on your Rackspace account

Callback returns `f(err, servers)` where `servers` is an `Array`

#### client.createServer(options, callback)
Creates a server with the options specified

Options are as follows:

```js
{
  name: 'serverName', // required
  flavor: 'flavor1',  // required
  image: 'image1',    // required
  personality: []     // optional
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

Options include:

```js
{
  type: 'HARD' // optional (defaults to 'SOFT')
}
```
Returns callback with a confirmation

#### client.rebuildServer(server, options, callback)
Rebuilds the specifed server with options

Options include:

```js
{
  image: '45a01744-2bcf-4a23-ae88-63317f768a2f', // required; image ID or instance of pkgcloud.core.compute.Image
  accessIPv4: '123.45.67.89' // optional; IPv4 address of server
  accessIPv6: 'f0::09', // optional; IPv6 address of server
  adminPass: 'foobar', // optional; administrator password for the server
  metadata: { group: 'webservers' }, // optional; metadata key/value pairs
  personality: [ { path: '/etc/banner.txt', contents: 'ICAgICAgDQo' } ], // optional; personality files - path and contents
  'OS-DCF:diskConfig': 'AUTO' // optional; disk configuration value ("AUTO" | "MANUAL")  
}
```
Returns callback with a confirmation

**Note about backwards compatiblity:**
For backwards compatibility, it is also possible to pass an image ID or instance of `pkgcloud.core.compute.Image` as the value of the `options` argument.

#### client.getVersion(callback)

Get the current version of the api returned in a callback `f(err, version)`

#### client.getLimits(callback)

Get the current API limits returned in a callback `f(err, limits)`

**flavors**

#### client.getFlavors(callback)

Returns a list of all possible server flavors available in the callback `f(err,
flavors)`

#### client.getFlavor(flavor, callback)
Returns the specified rackspace flavor of Rackspace Images by ID or flavor
object in the callback `f(err, flavor)`

**images**

#### client.getImages(callback)
Returns a list of the images available for your account

`f(err, images)`

#### client.getImage(image, callback)
Returns the image specified

`f(err, image)`

#### client.createImage(options, callback)
Creates an Image based on a server

Options include:

```js
{
  name: 'imageName',  // required
  server: 'serverId'  // required
}
```

Returns the newly created image

`f(err, image)`

#### client.destroyImage(image, callback)
Destroys the specified image and returns a confirmation

`f(err, {ok: imageId})`

## Volume Attachments

Attaching a volume to a compute instance requires using a rackspace compute client, as well as possessing a `volume` or `volumeId`. Detaching volumes behaves the same way.

#### client.getVolumeAttachments(server, callback)

Gets an array of volumeAttachments for the provided server.

`f(err, volumeAttachments)`

#### client.getVolumeAttachmentDetails(server, attachment, callback)

Gets the details for a provided server and attachment. `attachment` may either be the `attachmentId` or an object with `attachmentId` as a property.

`f(err, volumeAttachment)`

#### client.attachVolume(server, volume, callback)

Attaches the provided `volume` to the `server`. `volume` may either be the `volumeId` or an instance of `Volume`.

`f(err, volumeAttachment)`

#### client.detachVolume(server, attachment, callback)

Detaches the provided `attachment` from the server. `attachment` may either be the `attachmentId` or an object with `attachmentId` as a property. If the `volume` is mounted this call will return an err.

`f(err)`