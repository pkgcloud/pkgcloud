## Using the OpenStack provider in pkgcloud

The OpenStack provider in pkgcloud supports the following services:

* [**BlockStorage**](blockstorage.md) (Cinder)
* [**Compute**](compute.md) (Nova)
* [**Databases**](databases.md) (databases)
* [**Storage**](storage.md) (Swift)
* [**Network**](network.md) (Neutron)
* [**Orchestration**](orchestration.md) (Heat)
* [**CDN**](cdn.md) (Poppy)

### Getting Started with Compute

We've provided a [simple compute example](getting-started-compute.md) where it creates a couple of compute instances.

### Authentication

For all of the OpenStack services, you create a client with the same options:

```javascript
  var openstack = pkgcloud.storage.createClient({
    provider: 'openstack', // required
    username: 'your-user-name', // required
    password: 'your-password', // required
    authUrl: 'your identity service url' // required
  });
```

**Note:** *Due to variances between OpenStack deployments, you may or may not need a `region` option.*

Keystone v2 (default) and v3 authentication endpoints are supported. To use a v3 endpoint with optional
parameters that may be required for your provider, additional object properties may be set
(see [source](https://github.com/pkgcloud/pkgcloud/blob/bigfile-test/lib/pkgcloud/openstack/context/identity.js) for all):

```javascript
  var openstack = pkgcloud.storage.createClient({
    // ... Options as above ...
    keystoneAuthVersion: 'v3',
    tenantId: "tenant-id",
    domainId: "domain-id", // could also set domainName
  });
```

### Authentication Endpoints and Regions

All of the OpenStack `createClient` calls have a few options that can be provided:

#### region

`region` specifies which region of a service to use.

##### Specifying a custom region

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'openstack',
    username: 'your-user-name',
    password: 'your-api-key',
    authUrl: 'https://your-identity-service'
    region: 'Calxeda-AUS1'
});
```

#### Tokens and Expiration

When you make your first call to a OpenStack provider, your client is authenticated transparent to your API call. OpenStack will issue you a token, with an expiration. When that token expires, the client will automatically re-authenticate and retrieve a new token. The caller shouldn't have to worry about this happening.
