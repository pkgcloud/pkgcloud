## Using the Rackspace provider in pkgcloud

The Rackspace provider in pkgcloud supports the following services:

* [**Compute**](compute.md) (Cloud Servers)
* [**Storage**](storage.md) (Cloud Files)
* [**Databases**](databases.md) (Cloud Databases)

### Getting Started with Compute

We've provided a [simple compute example](getting-started-compute.md) where it creates a couple of compute instances.

### Authentication

For all of the Rackspace services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key'
});s
```

In addition to your `apiKey`, you could alternately provide your `password` as an option to `createClient`.

### Authentication Endpoints and Regions

All of the Rackspace `createClient` calls have a few options that can be provided:

#### authUrl

`authUrl` specifies the authentication endpoint used to create a token for your Rackspace client. By default, this is set to the US endpoint: https://identity.api.rackspacecloud.com.

##### Authenticating against the London endpoint

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key',
    authUrl: 'https://lon.identity.api.rackspacecloud.com'
});
```

#### region

`region` specifies which region of a service to use. For example, when you authenticate with the US endpoint for compute, you have the option of either `DFW` or `ORD`. The default region is `DFW`. Previous pkgcloud versions did not let you specify which region you used, so all calls were against `DFW`.

##### Specifying a custom region

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'rackspace',
    username: 'your-user-name',
    apiKey: 'your-api-key',
    region: 'ORD'
});
```

#### Tokens and Expiration

When you make your first call to a Rackspace provider, your client is authenticated transparent to your API call. Rackspace will issue you a token, with an expiration. When that token expires, the client will automatically re-authenticate and retrieve a new token. The caller shouldn't have to worry about this happening.

