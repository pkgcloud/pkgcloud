# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Unified Vocabulary](#unified-vocabulary)
* [Services](#components)
  * [Compute](#compute)
    * [Creating Compute Clients](#creating-compute-clients)
    * [Server](#server)
    * [Image](#image)
    * [Flavor](#flavor)
  * [Storage](#storage)
    * [Creating Storage Clients](#creating-storage-clients)
    * [Container](#container)
    * [Uploading Files](#uploading)
    * [Downloading Files](#downloading)
  * [Database](#database)
    * [Creating Storage Clients](#creating-storage-clients)
* [Roadmap](#next-steps)

<a name="Unified Vocabulary"></a>
## Unified Vocabulary

When considering all IaaS providers as a whole, their vocabulary is somewhat disjointed. `pkgcloud` attempts to overcome this through a unified vocabulary. Note that all Database providers use the same vocabulary: _database_.

### Compute

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Joyent</th>
    <th>Amazon</th>
    <th>Azure</th>
  </tr>
  <tr>
    <td>Server</td>
    <td>Server</td>
    <td>Machine</td>
    <td>Instance</td>
    <td>Virtual Machine</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>Image</td>
    <td>Dataset</td>
    <td>AMI</td>
    <td>Image</td>
  </tr>
  <tr>
    <td>Flavor</td>
    <td>Flavor</td>
    <td>Package</td>
    <td>InstanceType</td>
    <td>RoleSize</td>
  </tr>
</table>

### Storage

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Amazon</th>
    <th>Azure</th>
  </tr>
  <tr>
    <td>Container</td>
    <td>Container</td>
    <td>Bucket</td>
    <td>Container</td>
  </tr>
  <tr>
    <td>File</td>
    <td>StorageObject</td>
    <td>Object</td>
    <td>Blob</td>
  </tr>
</table>

<a name="services"></a>
## Services

Currently there are several service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

<a name="compute"></a>
### Compute

<a name="creating-compute-clients"></a>
#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.Client` object should be:

**Rackspace**

``` js
  var rackspace = pkgcloud.compute.createClient({
    provider: 'rackspace',
    username: 'nodejitsu',
    apiKey: 'foobar'
  });
```

**Amazon**

``` js
  var amazon = pkgcloud.compute.createClient({
    provider: 'amazon',
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  });
```

**Joyent**

``` js
  var path = require('path'),
      fs   = require('fs');

  //
  // Joyent requires a username / password or key / keyId combo.
  // key/keyId should be registered in Joyent servers.
  // check `test/helpers/index.js` for details on key/keyId works.
  //
  var joyent = pkgcloud.compute.createClient({
    provider: 'joyent',
    account: 'nodejitsu'
    keyId: '/nodejitsu1/keys/dscape',
    key: fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'), 'ascii')
  });
```

**Azure**

``` js
  var azure = pkgcloud.compute.createClient({
    provider: 'azure',
    storageAccount: "test-storage-account",			//name of your storage account
    storageAccessKey: "test-storage-access-key", 	//access key for storage account
    managementCertificate: "./test/fixtures/azure/cert/management/management.pem",
    subscriptionId: "azure-account-subscription-id",
    azure: {
        location: "East US",	//azure location for server
        username: "pkgcloud",	//username for server
        password: "Pkgcloud!!",	//password for server
        ssh : {					//ssh settings for linux server
            port: 22,			//default is 22
            pem: "./test/fixtures/azure/cert/ssh/mycert.pem",
            pemPassword: ""
        },
        rdp : {					// rdp settings for windows server
            port: 3389
        }
	});
```
See  [azure.md](blob/master/docs/azure.md) for more information on the Azure configuration settings.

<br>

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

<a name="storage"></a>
### Storage

<a name="creating-storage-clients"></a>
#### Creating Storage Clients
The options to be passed to the `pkgcloud.storage.Client` object should be:

**Rackspace**

``` js
  {
    provider: 'rackspace', // 'cloudservers'
    username: 'nodejitsu',
    apiKey: 'foobar'
  }
```

**AWS**

``` js
  {
    provider: 'amazon', // 'aws', 's3'
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  }
```

* **pkgcloud.storage.create(options, callback)**
* **new pkgcloud.storage.Client(options, callback)**

**Azure**

``` js
  {
    provider: 'azure',
    storageAccount: "test-storage-account",		//name of your storage account
    storageAccessKey: "test-storage-access-key"	//access key for storage account
  }
```
See  [azure.md](blob/master/docs/azure.md) for more information on the Azure configuration settings.

<a name="roadmap"></a>
## Roadmap

1. Add support for additional IaaS providers (Azure, etc)
2. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
3. 

#### Author: [Nodejitsu](http://nodejitsu.com)
#### License: MIT