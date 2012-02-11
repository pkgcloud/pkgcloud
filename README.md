# pkgcloud 

Communicate across multiple cloud providers in an platform agnostic manner.

* [Motivation](#motivation)
* [System Breakdown](#system-breakdown)
* [Unified Vocabulary](#unified-vocabulary)
* [Components](#components)
  * [Compute](#compute)
    * [Creating Compute Components](#creating-computer-components)
    * [Image](#image)
  * [Storage](#storage)
  * [DNS](#dns)
  * [CDN](#cdn)
  * [Load Balancers](#load-balancers)
* [Next Steps](#next-steps)

<a name="motivation"></a>
## Motivation

Currently `Nodejitsu` maintains several API libraries for communicating with Cloud environments:

* [node-cloudfiles](https://github.com/nodejitsu/node-cloudfiles)
* [node-cloudservers](https://github.com/nodejitsu/node-cloudservers)
* [node-zerigo](https://github.com/nodejitsu/node-zerigo)

There are also some other decent libraries out there:

* [knox](https://github.com/learnboost/knox)

The main problem is that these libraries **are not consistent in anyway.**

`pkgcloud` is a consistent layer across multiple cloud providers.

<a name="Unified Vocabulary"></a>
## Unified Vocabulary

When considering all IaaS providers as a whole their vocabulary is somewhat disjoint. `pkgcloud` attempts to overcome this through a unified vocabulary:

**Compute**

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Joyent</th>
    <th>Amazon</th>
  </tr>
  <tr>
    <td>Server</td>
    <td>Server</td>
    <td>Machine</td>
    <td>Instance</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>Image</td>
    <td>Dataset</td>
    <td>AMI</td>
  </tr>
  <tr>
    <td>Flavor</td>
    <td>Flavor</td>
    <td>Package</td>
    <td>InstanceType</td>
  </tr>
</table>

<a name="system-breakdown"></a>
## System Breakdown

In order of priority the components and providers we need to implement are:

### Components

1. Compute
2. Storage
3. DNS
4. CDN
5. Load Balancers

### Providers

1. Rackspace
2. Joyent
3. Amazon

<a name="components"></a>
## Components

<a name="compute"></a>
### Compute

<a name="creating-computer-components"></a>
#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.Client` object should be:

**Rackspace**

``` js
var rackspace = pkgcloud.compute.createClient(
  {
    provider : 'rackspace',
    username : 'nodejitsu',
    apiKey   : 'foobar'
  }
);
```

**AWS**

``` js
var amazon = pkgcloud.compute.createClient(
  {
    provider    : 'amazon',
    accessKey   : 'asdfkjas;dkj43498aj3n',
    accessKeyId : '98kja34lkj'
  }
);
```

**Joyent**

``` js
var path = require('path'),
    fs   = require('fs');

// joyent needs a username/password or key/keyId combo.
// key/keyId should be registered in Joyent servers.
// check `test/helpers/index.js` for details on key/keyId works.
var joyent = pkgcloud.compute.createClient(
  {
    provider : 'joyent',
    account  : 'nodejitsu'
    keyId    : '/nodejitsu1/keys/dscape',
    key      : 
      fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'), 'ascii')
  }
);
```

<a name="image"></a>
#### Image

* `client.getImages(callback)` with the `first argument of the callback` being an `error`, and the `second argument of the callback` being an `array of Image`.
* `client.getImage(image, callback)` with `image` being either an `Image or a String` that represents an Image id, with the `first argument of the callback` being an `error`, and the `second argument of the callback` being the `image` that was returned.
* `client.destroyImage(image, callback)` with `image` being either an `Image or a String` that represents an Image id, with the `first argument of the callback` being an `error`, and the `second argument of the callback` being a json object in the form of `{"ok": deletedId}`.
* `createImage(options, callback)` with `options` an json object in the form `{"name": "NameToGiveToImage", "server": "ServerOrServerIdToBaseImageUpon"}`, with the `first argument of the callback` being an `error`, and the `second argument of the callback` being the `image` that was returned.

<a name="storage"></a>
### Storage

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

#### Using Storage Clients
Most of this can be modeled off of the [node.js core 'fs' module](http://nodejs.org/docs/v0.4.12/api/fs.html) API although there needs to be some improvements for copying files and creating root directories (i.e. containers)

<a name="dns"></a>
### DNS

<a name="cdn"></a>
### CDN

<a name="load-balancers"></a>
### Load Balancers

<a name="next-steps"></a>
## NEXT STEPS

1. Stub out an API which works well across providers
2. Try implementing it for a couple of providers
3. REPEAT

#### Author: [Nodejitsu](http://nodejitsu.com)
#### License: CLOSED

[0]: http://fog.io
[1]: http://libcloud.apache.org/index.html
[2]: http://vowsjs.org
[3]: http://npmjs.org
[smartdc]: https://github.com/joyent/node-smartdc