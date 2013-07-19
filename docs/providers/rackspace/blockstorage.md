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

* [Volumes](#volumes)
* [Snapshots](#snapshots)
* [VolumeTypes](#volume-types)

### Volumes

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

### Snapshots

#### client.getSnapshots(detailed, callback)
Lists all snapshots that are available to use on your Rackspace account

Callback returns `f(err, snapshots)` where `snapshots` is an `Array`. `detailed` is an optional `boolean` which will return the full snapshot details if true.

#### client.getSnapshot(snapshot, callback)
Gets specified snapshot.

Takes snapshot or snapshotId as an argument and returns the snapshot in the callback
`f(err, snapshot)`

#### client.createSnapshot(options, callback)
Creates a snapshot with the options specified

Options are as follows:

```js
{
  name: 'volumeName', // required
  description: 'my volume',  // required
  volumeId: 'asdf1234', // required, volume id of the new snapshot
  force: true // optional, defaults to false. force creation of the snapshot
}
```
Returns the new snapshot in the callback `f(err, snapshot)`

#### client.deleteSnapshot(snapshot, callback)
Deletes the specified snapshot

Takes snapshot or snapshotId as an argument and returns an error if unsuccessful `f(err)`

#### client.updateSnapshot(snapshot, callback)
Updates the name & description on the provided snapshot.

Returns callback with a confirmation

### Volume Types

Volume types are used to define which kind of new volume to create.

#### client.getVolumeTypes(callback)
Lists all volumeTypes that are available to use on your Rackspace account

Callback returns `f(err, volumeTypes)` where `volumeTypes` is an `Array`.

#### client.getVolumeType(volumeType, callback)
Gets specified volumeType.

Takes volumeType or volumeTypeId as an argument and returns the volumeType in the callback
`f(err, volumeType)`
