## pkgcloud documentation

pkgcloud is a multi-provider cloud provisioning library for node.js that abstracts away differences among multiple cloud providers.

### Unified Vocabulary

Due to the differences between the vocabulary for each service provider, **[pkgcloud uses its own unified vocabulary](vocabulary.md).**

### Supported Providers

Supporting every API for every cloud service provider in Node.js is a huge undertaking, but _that is the long-term goal of `pkgcloud`_. **Special attention has been made to ensure that each service type has enough providers for a critical mass of portability between providers** (i.e. Each service implemented has multiple providers).

* **[Compute](#compute)** [*Compute Client Commonality*](compute-commonality.md)
  * [Joyent](providers/joyent.md#using-compute)
  * [Azure](providers/azure.md#using-compute)
  * [Rackspace](providers/rackspace/compute.md)
  * [Amazon](providers/amazon.md#using-compute)
* **[Storage](#storage)**
  * [Azure](providers/azure.md#using-storage)
  * [Rackspace](providers/rackspace/storage.md)
  * [Amazon](providers/amazon.md#using-storage)
* **[Database](#database)**
  * [IrisCouch](providers/iriscouch.md)
  * [MongoLab](providers/mongolab.md)
  * [Rackspace](providers/rackspace/database.md)
  * [MongoHQ](providers/mongohq.md)
  * [RedisToGo](providers/redistogo.md)
