# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Getting started](#getting-started)
  * [Basic APIs](#basic-apis)
  * [Supported APIs](#supported-apis)
* [Compute](#compute)
* [Storage](#storage)
  * [Uploading Files](#uploading)
  * [Downloading Files](#downloading)
* [Database](#database)
* _Fine Print_
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

Due to the differences between the vocabulary for each service provider, **[pkgcloud uses its own unified vocabulary](https://github.com/nodejitsu/pkgcloud/blob/master/docs/vocabulary.md).** 

* **Compute:** Server, Image, Flavor
* **Storage:** Container, File

<a name="supported-apis"></a>
### Supported APIs

Supporting every API for every cloud service provider in Node.js is a huge undertaking, but _that is the long-term goal of `pkgcloud`_. **Special attention has been made to ensure that each service type has enough providers for a critical mass of portability between providers** (i.e. Each service implemented has multiple providers).

* **[Compute](#compute)**
  * [Joyent](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/joyent.md#compute)
  * [Azure](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/azure.md#compute)
  * [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#compute)
  * [Amazon](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/amazon.md#compute)
* **[Storage](#storage)**
  * [Azure](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/azure.md#storage)
  * [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#storage)
  * [Amazon](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/amazon.md#storage)
* **[Database](#database)**
  * [IrisCouch](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/iriscouch.md)
  * [MongoLab](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/mongolab.md)
  * [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#database)
  * [MongoHQ](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/mongohq.md)
  * [RedisToGo](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/redistogo.md)
  

<a name="compute"></a>
## Compute

The `pkgcloud.compute` service is designed to make it easy to provision and work with VMs. To get started with a `pkgcloud.compute` client just create one:

```
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

* [Joyent](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/joyent.md#compute)
* [Azure](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/azure.md#compute)
* [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#compute)
* [Amazon](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/amazon.md#compute)

Each instance of `pkgcloud.compute.Client` has a set of uniform APIs:

* [Server](#server)
* [Image](#image)
* [Flavor](#flavor)

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

* `pkgcloud.storage.create(options, callback)`
* `new pkgcloud.storage.Client(options, callback)`


* [Azure](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/azure.md#storage)
* [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#storage)
* [Amazon](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/amazon.md#storage)

<a name="database"></a>
## Databases

* [IrisCouch](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/iriscouch.md)
* [MongoLab](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/mongolab.md)
* [Rackspace](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/rackspace.md#database)
* [MongoHQ](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/mongohq.md)
* [RedisToGo](https://github.com/nodejitsu/pkgcloud/blob/master/docs/providers/redistogo.md)


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