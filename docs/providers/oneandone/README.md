## Using the 1&1 provider in pkgcloud

The 1&1 provider in pkgcloud supports the following services:

* [**Compute**](compute.md) (Cloud Servers)
* [**Block Storage**](blockstorage.md) (Cloud Block Storage) *(beta)*
* [**Load Balancers**](loadbalancer.md) (Cloud Load Balancers) *(beta)*

### Getting Started with Compute

We've provided a [simple compute example](getting-started-compute.md) where it creates a couple of compute instances.

### Authentication

For all of the Rackspace services, you create a client with the same options:

you can store the token in your Environment variables just like below.

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'oneandone',
    token: process.env.OAO_TOKEN
});
```


### Datacenters

All of the 1&1 Oneandone `createClient` calls have a few options that can be provided:

#### location

`location` specifies which region of a service to use. Different services have different regions enabled. The current list of regions is:

- `ES` (Spain)
- `US` (United States of America)
- `DE` (Germany)
- `GB` (United Kingdom of Great Britain and Northern Ireland)