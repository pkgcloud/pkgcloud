## Using the Rackspace DNS provider

* Zone
  * [Model](#zone-model)
  * [APIs](#zone-apis)
* Record
  * [Model](#record-model)
  * [APIs](#record-apis)

Creating a client is straight-forward:

``` js
  var rackspace = pkgcloud.dns.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key'
  });
```

Learn about [more options for creating clients](README.md) in the Rackspace `dns` provider.

### Zone Model

A Zone for Rackspace DNS has following properties:

```Javascript
{
  id: 12345678, // Rackspace ID of your dns zone
  name: 'example.com', // the domain name for the zone
  nameservers: [
    {
      name: 'dns1.stabletransit.com'
    },
    {
      name: 'dns2.stabletransit.com'
    }
  ], // the nameservers for the zone
  emailAddress: 'hostmaster@example.com', // the SOA contact email address
  created: '2013-07-31T16:21:33.000Z',
  updated: '2013-07-31T16:21:33.000Z'
}
```

### Record Model

A Record for Rackspace DNS has the following properties:

```Javascript
{
    id: 'NS-8978855', // The Rackspace ID for the record
    name: 'www.example.com', // The DNS record
    type: 'A', // The type of record
    ttl: 3600, // TTL of the record, in seconds
    data: '192.168.10.10', // Data for the record
    created: '2013-07-31T16:21:33.000Z',
    updated: '2013-07-31T16:21:33.000Z'
}
```

### Zone APIs

* [`client.getZones(details, function(err, zones) { })`](#clientgetzones-details-functionerr-zones--)
* [`client.getZone(zone, function(err, zone) { })`](#clientgetzonezone-functionerr-zone--)
* [`client.createZone(zone, function(err, zone) { })`](#clientcreatezonezone-functionerr-zone--)
* [`client.createZones(zones, function(err, zones) { })`](#clientcreatezonezone-functionerr-zone--)
* [`client.importZone(zone, function(err, zone) { })`](#clientcreatezonezone-functionerr-zone--)
* [`client.exportZone(zone, function(err, result) { })`](#clientcreatezonezone-functionerr-zone--)
* [`client.updateZone(zone, function(err) { })`](#clientupdatezonemetadatazone-functionerr-zone--)
* [`client.updateZones(zones, function(err) { })`](#clientupdatezonemetadatazone-functionerr-zone--)
* [`client.deleteZone(zone, function(err) { })`](#clientremovezonemetadatazone-metadatatoremove-functionerr-zone--)
* [`client.deleteZones(zones, function(err) { })`](#clientremovezonemetadatazone-metadatatoremove-functionerr-zone--)
* [`client.getZoneChanges(zone, metadataToRemove, function(err, zone) { })`](#clientremovezonemetadatazone-metadatatoremove-functionerr-zone--)
* [`client.cloneZone(zone, metadataToRemove, function(err, zone) { })`](#clientremovezonemetadatazone-metadatatoremove-functionerr-zone--)
* [`client.getSubZones(zone, metadataToRemove, function(err, zone) { })`](#clientremovecontainermetadatacontainer-metadatatoremove-functionerr-container--)

### Container API Details

For all of the container methods, you can pass either an instance of [`container`](#container) or the container name as `container`. For example:

```Javascript
client.getContainer('my-container', function(err, container) { ... });
```

This call is functionally equivalent to:

```Javascript
var myContainer = new Container({ name: 'my-container' });

client.getContainer(myContainer, function(err, container) { ... });
```

#### client.getContainers(function(err, containers) { })

Retreives the containers for the current client instance as an array of [`container`](#container-model)

#### client.getContainer(container, function(err, container) { })

Retrieves the specified [`container`](#container-model) from the current client instance.

#### client.createContainer(container, function(err, container) { })

Creates a new [`container`](#container-model) with the name from argument `container`. You can optionally provide `metadata` on the request:

```javascript
client.createContainer({
 name: 'my-container',
 metadata: {
  brand: 'bmw',
  model: '335i'
  year: 2009
 }}, function(err, container) {
  // ...
 })
```

#### client.destroyContainer(container, function(err, result) { })

Removes the [`container`](#container-model) from the storage account. If there are any files within the `container`, they will be deleted before removing the `container` on the client. `result` will be `true` on success.

#### client.updateContainerMetadata(container, function(err, container) { })

Updates the metadata on the provided [`container`](#container-model) . Currently, the `updateContainer` method only adds new metadata fields. If you need to remove specific metadata properties, you should call `client.removeContainerMetadata(...)`.

```javascript
container.metadata.color = 'red';
client.updateContainerMetadata(container, function(err, container) {
  // ...
})
```

#### client.removeContainerMetadata(container, metadataToRemove, function(err, container) { })

Removes the keys in the `metadataToRemove` object from the stored [`container`](#container-model) metadata.

```Javascript
client.removeContainerMetadata(container, { year: false }, function(err, c) {
  // ...
});
```

### File APIs

* [`client.upload(options, function(err, result) { })`](#clientuploadoptions-functionerr-result--)
* [`client.download(options, function(err, file) { })`](#clientdownloadoptions-functionerr-file--)
* [`client.getFile(container, file, function(err, file) { })`](#clientgetfilecontainer-file-functionerr-file--)
* [`client.getFiles(container, function(err, file) { })`](#clientgetfilescontainer-functionerr-file--)
* [`client.removeFile(container, file, function(err, result) { })`](#clientremovefilecontainer-file-functionerr-result--)
* [`client.updateFileMetadata(container, file, function(err, file) { })`](#clientupdatefilemetadatacontainer-file-functionerr-file--)

### File API Details

For all of the file methods, you can pass either an instance of [`container`](#container-model) or the container name as `container`. For example:

```Javascript
client.getFile('my-container', 'my-file', function(err, file) { ... });
```

This call is functionally equivalent to:

```Javascript
var myContainer = new Container({ name: 'my-container' });

client.getFile(myContainer, 'my-file', function(err, file) { ... });
```

#### client.upload(options, function(err, result) { })

Returns a writeable stream. Upload a new file to a [`container`](#container-model). `result` will be `true` on success.

To upload a file, you need to provide an `options` argument:

```Javascript
var options = {
    // required options
    container: 'my-container', // this can be either the name or an instance of container
    remote: 'my-file', // name of the new file

    // optional, either stream or local
    stream: myStream, // any instance of a readable stream
    local: '/path/to/local/file' // a path to any local file

    // Other optional values
    metadata: { // provide any number of property/values for metadata
      campaign: '2012 magazine'
    },
    headers: { // optionally provide raw headers to send to cloud files
      'content-type': 'application/json'
    }
};
```

You need not provide either `stream` or `local`. `client.upload` returns a writeable stream, so you can simply pipe directly into it from your stream. For example:

```Javascript
var fs = require('fs'),
    pkgcloud = require('pkgcloud');

var client = pkgcloud.providers.rackspace.storage.createClient({ ... });

var myFile = fs.createReadStream('/my/local/file');

myFile.pipe(client.upload({
    container: 'my-container',
    remote: 'my-file'
}, function(err, result) {
    // handle the upload result
}));
```

You could also upload a local file via the `local` property on `options`:

```Javascript
var pkgcloud = require('pkgcloud');

var client = pkgcloud.providers.rackspace.storage.createClient({ ... });

client.upload({
    container: 'my-container',
    remote: 'my-file',
    local: '/path/to/my/file'
}, function(err, result) {
    // handle the upload result
});
```

This is functionally equivalent to piping from an `fs.createReadStream`, but has a simplified calling convention.

#### client.download(options, function(err, file) { })

Returns a readable stream. Download a [`file`](#file-model) from a [`container`](#container-model).

To download a file, you need to provide an `options` argument:

```Javascript
var options = {
    // required options
    container: 'my-container', // this can be either the name or an instance of container
    remote: 'my-file', // name of the new file

    // optional, either stream or local
    stream: myStream, // any instance of a writeable stream
    local: '/path/to/local/file' // the path to a local file to write to
};
```

You need not provide either `stream` or `local`. `client.download` returns a readable stream, so you can simply pipe it into your writeable stream. For example:

```Javascript
var fs = require('fs'),
    pkgcloud = require('pkgcloud');

var client = pkgcloud.providers.rackspace.storage.createClient({ ... });

var myFile = fs.createWriteStream('/my/local/file');

client.download({
    container: 'my-container',
    remote: 'my-file'
}, function(err, result) {
    // handle the download result
})).pipe(myFile);
```

You could also download to a local file via the `local` property on `options`:

```Javascript
var pkgcloud = require('pkgcloud');

var client = pkgcloud.providers.rackspace.storage.createClient({ ... });

client.download({
    container: 'my-container',
    remote: 'my-file',
    local: '/path/to/my/file'
}, function(err, result) {
    // handle the download result
});
```

This is functionally equivalent to piping from an `fs.createWriteStream`, but has a simplified calling convention.

#### client.getFile(container, file, function(err, file) { })

Retrieves the specified [`file`](#file-model) details in the specified [`container`](#container-model) from the current client instance.

#### client.getFiles(container, function(err, files) { })

Retreives an array of [`file`](#file-model) for the provided [`container`](#container-model).

#### client.removeFile(container, file, function(err, result) { })

Removes the provided [`file`](#file-model) from the provided [`container`](#container-model).

#### client.updateFileMetadata(container, file, function(err, file) { })

Updates the [`file`](#file-model) metadata in the the provided [`container`](#container-model).

File metadata is completely replaced with each callt o updateFileMetadata. This is different than container metadata. To delete a property, just remove it from the metadata attribute on the `File` and call `updateFileMetadata`.
```javascript
file.metadata = {
 campaign = '2011 website'
};

client.updateFileMetadata(file.container, file, function(err, file) {
  // ...
});
```

