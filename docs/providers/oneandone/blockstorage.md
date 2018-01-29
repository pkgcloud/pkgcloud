## Using the 1&1 Block Storage provider

#### BETA - This API may change as additional providers for block storage are added to pkgcloud

Creating a block-storage client is straight-forward:

``` js
  var oneandone = pkgcloud.blockstorage.createClient({
    provider: 'oneandone', // required
    token: 'apikey', // required
   });
```

[More options for creating clients](README.md)

* Snapshot
  * [Model](#snapshot-model)
  * [APIs](#snapshot-apis)
* BlockStorage
  * [Model](#block-storage-model)
  * [APIs](#block-storage-apis)

### Snapshot Model

A Snapshot for BlockStorage has the following properties:

```Javascript
{
  id: '12345678-1111-2222-3333-123456789012', // id of the snapshot
}
```

### Snapshot APIs

#### client.getSnapshots(options, callback)
Returns a list of the server's snapshots.

Callback returns `f(err, snapshots)` where `snapshots` is an `Array`. `options` is an optional `boolean` which will return the full snapshot details if true.

#### client.createSnapshot(details, callback)
Creates a snapshot with the details specified

Options are as follows:

```js
{
  server: '81504C620D98BCEBAA5202D145203B4B',//Server or Server id to create the snapshot from
}

```
Returns the new snapshot in the callback `f(err, snapshot)`

#### client.deleteSnapshot(snapshot, callback)
Removes a snapshot

Takes snapshot or snapshotId as an argument and returns an error if unsuccessful `f(err)`

#### client.updateSnapshot(snapshot, callback)
Restores a snapshot into the server.

Returns callback with a confirmation

### Block Storage Model

A BlockStorage has the following properties:

```Javascript
{
  id: '6AD2F180B7B666539EF75A02FE227084',
  size: 200,
  state: 'ACTIVE',
  description: 'My block storage for containers',
  datacenter: {
    id: 'D0F6D8C8ED29D3036F94C27BBB7BAD36',
    location: 'USA',
    country_code: 'US'
  },    
  name: 'My block storage 1',
  creation_date: '2015-05-06T08:33:25+00:00',
  server:
  {
    'id': '638ED28205B1AFD7ADEF569C725DD85F',
    'name': 'My server 1'    
  }  
}
```

### Block Storage APIs

#### client.getVolumes(options, callback)
Returns a list of the block storages.

Callback returns `f(err, blockstorages)` where `blockstorages` is an `Array`.

#### client.getVolume(volume, callback)
Returns a block storage.

Callback returns `f(err, blockstorage)` where `blockstorage` is a `BlockStorage` object.

#### client.createVolume(details, callback)
Creates a block storage with the details specified

Details are as follows:

```js
{
  name: 'My block storage', //block storage name
  size: 20, //size of the block storage
  description: 'My block storage for containers', //description of the block storage
  datacenter_id: 'D0F6D8C8ED29D3036F94C27BBB7BAD36', //id of the datacenter where the block storage will be created
  server_id: '638ED28205B1AFD7ADEF569C725DD85F', //id of the server that the block storage will be attached to
}
```
Returns the new block storage in the callback `f(err, blockstorage)`

#### client.updateVolume(volume, callback)
Updates a volume's attributes.

```js
{
  name: 'Updated name',
  description: 'Updated description'
}
```

Callback returns `f(err, blockstorage)` where `blockstorage` is the updated `BlockStorage` object.

#### client.deleteVolume(volume, callback)
Removes a block storage

Takes block storage object or a block storage ID as an argument and returns an error if unsuccessful `f(err)`
