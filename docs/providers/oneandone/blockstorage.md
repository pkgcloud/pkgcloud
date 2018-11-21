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