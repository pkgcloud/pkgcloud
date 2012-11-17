# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Unified Vocabulary](#unified-vocabulary)
* [Services](#components)
  * [Compute](#compute)
    * [Creating Compute Clients](#creating-compute-clients)
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

<a name="services"></a>
## Services

Currently there are three service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

<a name="compute"></a>
### Compute

<a name="creating-compute-clients"></a>
#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.createClient` object should be:

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
See  [azure.md](docs/azure.md) for more information on the Azure configuration settings.

<br>


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

* `pkgcloud.storage.create(options, callback)`
* `new pkgcloud.storage.Client(options, callback)`

**Azure**

``` js
  {
    provider: 'azure',
    storageAccount: "test-storage-account",		//name of your storage account
    storageAccessKey: "test-storage-access-key"	//access key for storage account
  }
```
See  [azure.md](docs/azure.md) for more information on the Azure configuration settings.

<a name="database"></a>
### Databases

<a name="creating-databases-clients"></a>
#### Creating Databases Clients
The options to be passed to the `pkgcloud.database.createClient` object should be:


<a name="roadmap"></a>
## Roadmap

1. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
3. 

#### Author: [Nodejitsu](http://nodejitsu.com)
#### License: MIT