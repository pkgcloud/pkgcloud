## Using the Rackspace Storage provider

Creating a client is straight-forward:

``` js
  var rackspace = pkgcloud.storage.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key'
  });
```

[More options for creating clients](README.md)

### Models

#### Container

Containers for Rackspace have the following properties

* name
* count
* bytes
* ttl
* logRetention
* cdnEnabled (bool)
* cdnUri
* cdnSslUri

#### File

Files for Rackspace have the following properties

* name
* container
* size
* contentType
* etag
* lastModified

### API Methods

#### Container APIs

* [`client.getContainers(function(err, containers) { })`](#clientgetcontainersfunctionerr-containers--)
* [`client.getContainer(container, function(err, container) { })`](#clientgetcontainercontainer-functionerr-container--)
* [`client.createContainer(container, function(err, container) { })`](#clientcreatecontainercontainer-functionerr-container--)
* [`client.destroyContainer(container, function(err, true) { })`](#clientdestroycontainercontainer-functionerr-true--)

#### File APIs

* [`client.upload(options, function(err, true) { })`](#clientuploadoptions-functionerr-true--)
* [`client.download(options, function(err, file) { })`](#clientdownloadoptions-functionerr-true--)
* `client.getFile(container, file, callback)`
* `client.getFiles(container, download, callback)`
* `client.removeFile(container, file, callback)`

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

Retreives the containers for the current client instance as an array of [`container`](#container)

#### client.getContainer(container, function(err, container) { })

Retrieves the specified [`container`](#container) from the current client instance.

#### client.createContainer(container, function(err, container) { })

Creates a new [`container`](#container) with the name from argument `container`.

#### client.destroyContainer(container, function(err, true) { })

Removes the [`container`](#container) from the storage account. If there are any files within the `container`, they will be deleted before removing the `container` on the client.

### File API Details

For all of the file methods, you can pass either an instance of [`container`](#container) or the container name as `container`. For example:

```Javascript
client.getFile('my-container', 'my-file', function(err, file) { ... });
```

This call is functionally equivalent to:

```Javascript
var myContainer = new Container({ name: 'my-container' });

client.getFile(myContainer, 'my-file', function(err, file) { ... });
```

#### client.upload(options, function(err, true) { })

Upload a new file to a [`container`](#container). To upload a file, you need to provide an `options` argument:

* container
* remote *name of the new file*
* \[stream|local\] *optional*
