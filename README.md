# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Getting started](#getting-started)
  * [Basic APIs](#basic-apis)
  * [Providers](#providers)
* [Compute](#compute)
* [Storage](#storage)
  * [Uploading Files](#uploading)
  * [Downloading Files](#downloading)
* [Database](#database)
* Fine Print
  * [Installation](#installation)
  * [Tests](#tests)
  * [Roadmap](#roadmap)
  * [Contribute!](#contributing)

<a name="getting-started"></a>
## Getting Started

Currently there are three service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

These services are exposed in two ways:

1. **By service type:** For example, if you wanted to create an API client to communicate with a compute service you could simply:
``` js 
  var client = require('pkgcloud').compute.createClient({
    //
    // The name of the provider (e.g. "joyent")
    //
    provider: 'provider-name',
    
    //
    // ... Provider specific credentials
    //
  });
```
2. **By provider name:** For example, if you knew the name of the provider you wished to communicate with you could do so directly:
``` js
  var client = require('pkgcloud').providers.joyent.compute.createClient({
    //
    // ... Provider specific credentials
    //
  });
```

All API clients exposed by `pkgcloud` can be instantiated through `pkgcloud[serviceType].createClient({ ... })` or `pkcloud.providers[provider][serviceType].createClient({ ... })`.

<a name="compute"></a>
## Compute

<a name="creating-compute-clients"></a>
### Creating Compute Clients
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
    storageAccountKey: "test-storage-account-key", 	//access key for storage account
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

<a name="storage"></a>
## Storage

<a name="creating-storage-clients"></a>
### Creating Storage Clients
The options to be passed to the `pkgcloud.storage.createClient` object should be:

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
    storageAccount: "test-storage-account",			//name of your storage account
    storageAccountKey: "test-storage-account-key"	//access key for storage account
  }
```
See  [azure.md](docs/azure.md) for more information on the Azure configuration settings.

<a name="database"></a>
## Databases

<a name="creating-databases-clients"></a>
### Creating Databases Clients
The options to be passed to the `pkgcloud.database.createClient` object should be:


<a name="installation"></a>
## Installation

``` bash
  $ npm install pkgcloud
```

<a name="tests"></a>
## Tests
For run the tests you will need `vows@0.7.0` or higher, please install it and then run:

``` bash
 $ npm test
```

<a name="contributing"></a>
## Contribute!
We welcome contribution to `pkgcloud` by any and all individuals or organizations. Before contributing please take a look at the [Contribution Guidelines in CONTRIBUTING.md](https://github.com/nodejitsu/pkgcloud/blob/master/CONTRIBUTING.md).

We are pretty flexible about these guidelines, but the closer you follow them the more likely we are to merge your pull-request.

<a name="roadmap"></a>
## Roadmap

1. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
2. Include `CDN` and `DNS` services.


#### Author: [Nodejitsu](http://nodejitsu.com)
#### Contributors: [Charlie Robbins](https://github.com/indexzero), [Nuno Job](https://github.com/dscape), []
#### License: MIT