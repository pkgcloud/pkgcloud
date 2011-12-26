# pkgcloud 

A loose port of libcloud (python) or fog (ruby) for communicating across multiple cloud providers in an agnostic manner.

* [Motivation](#motivation)
* [Reviewing Libraries](#reviewing-libraries)
* [System Breakdown](#system-breakdown)
* [Unified Vocabulary](#unified-vocabulary)
* [Components](#components)
  * [Compute](#compute)
  * [Storage](#storage)
  * [DNS](#dns)
  * [CDN](#cdn)
  * [Load Balancers](#load-balancers)
* [Next Steps](#next-steps)

<a name="motiviation"></a>
## Motivation

Currently Nodejitsu maintains several API libraries for communicating with Cloud environments:

* [node-cloudfiles](https://github.com/nodejitsu/node-cloudfiles)
* [node-cloudservers](https://github.com/nodejitsu/node-cloudservers)
* [node-zerigo](https://github.com/nodejitsu/node-zerigo)

There are also some other decent libraries out there:

* [knox](https://github.com/learnboost/knox)

The main problem is that these libraries **are not consistent in anyway.** This is a problem we are going to have to address head on in [Conservatory](https://github.com/nodejitsu/conservatory) and this is the library to do it in.

With consistency in mind the one design decision I am sure of is using [request](https://github.com/mikeal/request) and [filed](https://github.com/mikeal/filed).

<a name="reviewing-libraries"></a>
## Reviewing Libraries

Overall, the consistency and semantics in the API design of [fog][0] is preferable (imho) as opposed to [libcloud][1]. [libcloud][1] is more complete in terms of the number of APIs it supports, but the syntax is a little kludgy. 

<a name="Unified Vocabulary"></a>
## Unified Vocabulary

When considering all IaaS providers as a whole their vocabulary is somewhat disjoint. `pkgcloud` attempts to overcome this through a unified vocabulary:

**Compute**

```
+-----------------------------------------------+
| pkgcloud | OpenStack | Joyent  | Amazon       |
+-----------------------------------------------+
| Server   | Server    | Machine | Instance     |
+-----------------------------------------------+
| Image    | Image     | Dataset | AMI          | 
+-----------------------------------------------+
| Flavor   | Flavor    | Package | InstanceType |
+-----------------------------------------------+
```


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

#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.Client` object should be:

**Rackspace**

``` js
  {
    provider: 'rackspace',
    username: 'nodejitsu',
    apiKey: 'foobar'
  }
```

**AWS**

``` js
  {
    provider: 'amazon', // 'aws', 'ec2'
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  }
```

* **pkgcloud.compute.create(options, callback)**
* **new pkgcloud.compute.Client(options, callback)**

#### Using Compute Clients
Most of this can be modelled off of the [node-cloudservers](https://github.com/nodejitsu/node-cloudservers) API although some of the Rackspace specific nomenclature (e.g. flavors) will have be updated. 

* client.createServer(options, callback)
* client.getServers(callback)
* client.listServers(callback)
* client.destoryServer(callback)
* client.createImage(options, callback)
* client.listImages(callback)
* client.destroyImage(options, callback)

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
Most of this can be modelled off of the [node.js core 'fs' module](http://nodejs.org/docs/v0.4.12/api/fs.html) API although there needs to be some improvements for copying files and creating root directories (i.e. containers)

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