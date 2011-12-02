# pkgcloud 

A loose port of libcloud (python) or fog (ruby) for communicating across multiple cloud providers in an agnostic manner.

## Motivation

Currently Nodejitsu maintains several API libraries for communicating with Cloud environments:

* [node-cloudfiles](https://github.com/nodejitsu/node-cloudfiles)
* [node-cloudservers](https://github.com/nodejitsu/node-cloudservers)
* [node-zerigo](https://github.com/nodejitsu/node-zerigo)

There are also some other decent libraries out there:

* [knox](https://github.com/learnboost/knox)

The main problem is that these libraries **are not consistent in anyway.** This is a problem we are going to have to address head on in [Conservatory](https://github.com/nodejitsu/conservatory) and this is the library to do it in.

With consistency in mind the one design decision I am sure of is using [request](https://github.com/mikeal/request) and [filed](https://github.com/mikeal/filed).

## Reviewing Libraries

Overall, the consistency and semantics in the API design of [fog][0] is preferable (imho) as opposed to [libcloud][1]. [libcloud][1] is more complete in terms of the number of APIs it supports, but the syntax is a little kludgy. 

## System Overview

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