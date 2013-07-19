##Using the Rackspace Block Storage provider

Creating a block-storage client is straight-forward:

``` js
  var rackspace = pkgcloud.blockstorage.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key'
  });
```

[More options for creating clients](README.md)

### API Methods

**Volumes**

#### client.getVolumes(detailed, callback)
Lists all volumes that are available to use on your Rackspace account

Callback returns `f(err, volumes)` where `volumes` is an `Array`. `detailed` is an optional `boolean` which will return the full volume details if true.

#### client.getVolume(volume, callback)
Gets specified volume.

Takes volume or volumeId as an argument and returns the volume in the callback
`f(err, volume)`

#### client.createVolume(options, callback)
Creates a volume with the options specified

Options are as follows:

```js
{
  name: 'volumeName', // required
  description: 'my volume',  // required
  size: 100,    // 100-1000 gb
  volumeType: 'SSD' // optional, defaults to spindles
  snapshotId: '1234567890' // optional, the snapshotId to use when creating the volume
}
```
Returns the new volume in the callback `f(err, volume)`

#### client.deleteVolume(volume, callback)
Deletes the specified volume

Takes volume or volumeId as an argument and returns an error if unsuccessful `f(err)`

#### client.updateVolume(volume, callback)
Updates the name & description on the provided volume. Does not support resize.

Returns callback with a confirmation

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