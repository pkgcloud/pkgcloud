# pkgcloud [![Build Status](https://secure.travis-ci.org/nodejitsu/pkgcloud.png?branch=master)](http://travis-ci.org/nodejitsu/pkgcloud) [![NPM version](https://badge.fury.io/js/pkgcloud.png)](http://badge.fury.io/js/pkgcloud)

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Getting started](#getting-started)
  * [Basic APIs](#basic-apis)
  * [Unified Vocabulary](#unified-vocabulary)
  * [Supported APIs](#supported-apis)
* [Compute](#compute)
* [Storage](#storage)
  * [Uploading Files](#uploading)
  * [Downloading Files](#downloading)
* [Database](#database)
* _Fine Print_
  * [Installation](#installation)
  * [Tests](#tests)
  * [Contribute!](#contributing)
  * [Roadmap](#roadmap)

<a name="getting-started"></a>
## Getting Started

Currently there are three service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

In our [Roadmap](#roadmap), we plan to add support for DNS and CDN services, but _these are not currently available._ 

<a name="basic-apis"></a>
### Basic APIs for pkgcloud

Services provided by `pkgcloud` are exposed in two ways:

* **By service type:** For example, if you wanted to create an API client to communicate with a compute service you could simply:

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

* **By provider name:** For example, if you knew the name of the provider you wished to communicate with you could do so directly:

``` js
  var client = require('pkgcloud').providers.joyent.compute.createClient({
    //
    // ... Provider specific credentials
    //
  });
```

All API clients exposed by `pkgcloud` can be instantiated through `pkgcloud[serviceType].createClient({ ... })` or `pkcloud.providers[provider][serviceType].createClient({ ... })`.

<a name="unified-vocabulary"></a>
### Unified Vocabulary

Due to the differences between the vocabulary for each service provider, **[pkgcloud uses its own unified vocabulary](docs/vocabulary.md).**

* **Compute:** [Server](#server), [Image](#image), [Flavor](#flavor)
* **Storage:** [Container](#container), [File](#file)

<a name="supported-apis"></a>
### Supported APIs

Supporting every API for every cloud service provider in Node.js is a huge undertaking, but _that is the long-term goal of `pkgcloud`_. **Special attention has been made to ensure that each service type has enough providers for a critical mass of portability between providers** (i.e. Each service implemented has multiple providers).

* **[Compute](#compute)**
  * [Joyent](docs/providers/joyent.md#using-compute)
  * [Azure](docs/providers/azure.md#using-compute)
  * [Rackspace](docs/providers/rackspace/compute.md)
  * [Amazon](docs/providers/amazon.md#using-compute)
* **[Storage](#storage)**
  * [Azure](docs/providers/azure.md#using-storage)
  * [Rackspace](docs/providers/rackspace/storage.md)
  * [Amazon](docs/providers/amazon.md#using-storage)
* **[Database](#database)**
  * [IrisCouch](docs/providers/iriscouch.md)
  * [MongoLab](docs/providers/mongolab.md)
  * [Rackspace](docs/providers/rackspace/database.md)
  * [MongoHQ](docs/providers/mongohq.md)
  * [RedisToGo](docs/providers/redistogo.md)
  
<a name="compute"></a>
## Compute

The `pkgcloud.compute` service is designed to make it easy to provision and work with VMs. To get started with a `pkgcloud.compute` client just create one:

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

Each compute provider takes different credentials to authenticate; these details about each specific provider can be found below:

* [Joyent](docs/providers/joyent.md#using-compute)
* [Azure](docs/providers/azure.md#using-compute)
* [Rackspace](docs/providers/rackspace/compute.md)
* [Amazon](docs/providers/amazon.md#using-compute)

Each instance of `pkgcloud.compute.Client` returned from `pkgcloud.compute.createClient` has a set of uniform APIs:

<a name="server"></a>
### Server
* `client.getServers(function (err, servers) { })`
* `client.createServer(options, function (err, server) { })`
* `client.destroyServer(serverId, function (err, server) { })`
* `client.getServer(serverId, function (err, server) { })`
* `client.rebootServer(server, function (err, server) { })`

<a name="image"></a>
### Image
* `client.getImages(function (err, images) { })`
* `client.getImage(imageId, function (err, image) { })`
* `client.destroyImage(image, function (err, ok) { })`
* `client.createImage(options, function (err, image) { })`

<a name="flavor"></a>
### Flavor
* `client.getFlavors(function (err, flavors) { })`
* `client.getFlavor(flavorId, function (err, flavor) { })`

<a name="storage"></a>
## Storage

The `pkgcloud.storage` service is designed to make it easy to upload and download files to various infrastructure providers. **_Special attention has been paid so that methods are streams and pipe-capable._**

To get started with a `pkgcloud.storage` client just create one:

``` js
  var client = require('pkgcloud').storage.createClient({
    //
    // The name of the provider (e.g. "joyent")
    //
    provider: 'provider-name',
  
    //
    // ... Provider specific credentials
    //
  });
```

Each compute provider takes different credentials to authenticate; these details about each specific provider can be found below:

* [Azure](docs/providers/azure.md#using-storage)
* [Rackspace](docs/providers/rackspace/storage.md)
* [Amazon](docs/providers/amazon.md#using-storage)

Each instance of `pkgcloud.storage.Client` returned from `pkgcloud.storage.createClient` has a set of uniform APIs:

<a name="container"></a>
### Container
* `client.getContainers(function (err, containers) { })`
* `client.createContainer(options, function (err, container) { })`
* `client.destroyContainer(containerName, function (err) { })`
* `client.getContainer(containerName, function (err, container) { })`

<a name="file"></a>
### File
* `client.upload(options, function (err) { })`
* `client.download(options, function (err) { })`
* `client.getFiles(container, function (err, files) { })`
* `client.getFile(container, file, function (err, server) { })`
* `client.removeFile(container, file, function (err) { })`

Both the `.upload(options)` and `.download(options)` have had **careful attention paid to make sure they are pipe and stream capable:**

### Upload a File
``` js
  var pkgcloud = require('pkgcloud'),
      fs = require('fs');
  
  var client = pkgcloud.storage.createClient({ /* ... */ });
  
  fs.createReadStream('a-file.txt').pipe(client.upload({
    container: 'a-container',
    remote: 'remote-file-name.txt'
  }));
```

### Download a File
``` js
  var pkgcloud = require('pkgcloud'),
      fs = require('fs');
  
  var client = pkgcloud.storage.createClient({ /* ... */ });
  
  client.download({
    container: 'a-container',
    remote: 'remote-file-name.txt'
  }).pipe(fs.createWriteStream('a-file.txt'));
```

<a name="database"></a>
## Databases

The `pkgcloud.database` service is designed to consistently work with a variety of Database-as-a-Service (DBaaS) providers. 

To get started with a `pkgcloud.storage` client just create one:

``` js
  var client = require('pkgcloud').database.createClient({
    //
    // The name of the provider (e.g. "joyent")
    //
    provider: 'provider-name',
  
    //
    // ... Provider specific credentials
    //
  });
```

Each database provider takes different credentials to authenticate; these details about each specific provider can be found below:

* **CouchDB**
  * [IrisCouch](docs/providers/iriscouch.md#couchdb)
* **MongoDB**
  * [MongoLab](docs/providers/mongolab.md)
  * [MongoHQ](docs/providers/mongohq.md)
* **Redis**
  * [IrisCouch](docs/providers/iriscouch.md#redis)
  * [RedisToGo](docs/providers/redistogo.md)
* **MySQL**
  * [Rackspace](docs/providers/rackspace/databases.md)
* **Azure Tables**
  * [Azure](docs/providers/azure.md#database)

Due to the various differences in how these DBaaS providers provision databases only a small surface area of the API for instances of `pkgcloud.database.Client` returned from `pkgcloud.database.createClient` is consistent across all providers:

* `client.create(options, callback)`

All of the individual methods are documented for each DBaaS provider listed above.

<a name="installation"></a>
## Installation

``` bash
  $ npm install pkgcloud
```

<a name="tests"></a>
## Tests
For run the tests you will need `mocha@1.9.x` or higher, please install it and then run:

``` bash
 $ npm test
```

The tests use the [`hock`](https://github.com/mmalecki/hock) library for mock up the response of providers, so the tests run without do any connection to the providers, there is a notorius advantage of speed on that, also you can run the tests without Internet connection and also can highlight a change of API just disabling `hock`.


### Running tests without mocks
By default the `npm test` command run the tests enabling `hock`. And sometimes you will want to test against the live provider, so you need to do this steps, in order to test without mocks.

1. Copy a provider config file from `test/configs/mock` to `test/configs`
2. Fill in with your own credentials for the provider.
3. (Optional) The compute test suite run the common tests for all providers listed on `test/configs/providers.json`, there you can enable or disable providers.
4. Run the tests using mocha.

``` bash
Mocha installed globally
 $ mocha -R spec test/*/*/*-test.js test/*/*/*/*-test.js

Linux/Mac - Mocha installed locally
 $ ./node_modules/.bin/mocha -R spec test/*/*/*-test.js test/*/*/*/*-test.js

Windows - Mocha installed locally:
 $ node_modules\.bin\mocha.cmd -R spec test/*/*/*-test.js test/*/*/*/*-test.js

```

### Other ways to run the tests
Also you can run the tests directly using `mocha` with `hock` enabled:

``` bash
Linux/Mac - Mocha installed globally:
 $ MOCK=on mocha -R spec test/*/*/*-test.js test/*/*/*/*-test.js
 
Linux/Mac - Mocha installed locally:
 $ MOCK=on node_modules/.bin/mocha -R spec test/*/*/*-test.js test/*/*/*/*-test.js

Windows - Mocha installed globally:
 $ set MOCK=on&mocha -R spec test/*/*/*-test.js test/*/*/*/*-test.js
 
Windows - Mocha installed locally:
 $ set MOCK=on&node_modules\.bin\mocha.cmd -R spec test/*/*/*-test.js test/*/*/*/*-test.js
```

Even better, you can run the tests for some specific provider:

``` bash
Linux/Mac - Mocha installed globally:
 $ MOCK=on mocha -R spec test/iriscouch/*/*-test.js

Linux/Mac - Mocha installed locally:
 $ MOCK=on ./node_modules/.bin/mocha -R spec test/iriscouch/*/*-test.js

Windows - Mocha installed globally:
 $ set MOCK=on&mocha -R spec test/iriscouch/*/*-test.js
 
Windows - Mocha installed locally:
 $ set MOCK=on&node_modules\.bin\mocha.cmd -R spec test/iriscouch/*/*-test.js

```



<a name="contributing"></a>
## Contribute!
We welcome contribution to `pkgcloud` by any and all individuals or organizations. Before contributing please take a look at the [Contribution Guidelines in CONTRIBUTING.md](CONTRIBUTING.md).

We are pretty flexible about these guidelines, but the closer you follow them the more likely we are to merge your pull-request.

<a name="roadmap"></a>
## Roadmap

1. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
2. Include `CDN` and `DNS` services.
3. Implement `fs` compatible file API.
4. Support additional service providers.

#### Author: [Nodejitsu Inc.](http://nodejitsu.com)
#### Contributors: [Charlie Robbins](https://github.com/indexzero), [Nuno Job](https://github.com/dscape), [Daniel Aristizabal](https://github.com/cronopio), [Marak Squires](https://github.com/marak), [Dale Stammen](https://github.com/stammen), [Ken Perkins](https://github.com/kenperkins)
#### License: MIT
