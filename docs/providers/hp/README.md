## Using the HP Cloud provider in pkgcloud

The HP Cloud provider in pkgcloud supports the following services:

* [**Compute**](compute.md) (Cloud Servers)
* [**Storage**](storage.md) (Cloud Files)

### Getting Started with Compute

We've provided a [simple compute example](getting-started-compute.md) where it creates a couple of compute instances.

### Authentication

For all of the HP Cloud services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'hp',
    username: 'your-user-name',
    password: 'your-password'
});
```

### Authentication Endpoints and Regions

All of the HP `createClient` calls have a few options that can be provided:

#### authUrl

`authUrl` specifies the authentication endpoint used to create a token for your HP client.
The HP Identity Service is currently available in two regions which can be accessed via these URLs.
See here for more details : [Regions](http://docs.hpcloud.com/api/identity/#2.2RegionsandAvailabilityZones)

##### Authenticating against the US-West endpoint

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'hp',
    username: 'your-user-name',
    password: 'your-password',
    region: 'region-a.geo-1',
    authUrl: 'https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/'
});
```

##### Authenticating against the US-East endpoint

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'hp',
    username: 'your-user-name',
    password: 'your-password',
    region: 'region-b.geo-1',
    authUrl: 'https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/'
});
```

#### region

`region` specifies which region of a service to use. HP has authentication endpoints specific to each region.
Please see section above for the endpoints and regions.

##### Specifying a custom region

```Javascript
var client = require('pkgcloud').compute.createClient({
    provider: 'hp',
    username: 'your-user-name',
    password: 'your-password',
    region: 'ORD'
});
```

#### Tokens and Expiration

When you make your first call to a HP provider, your client is authenticated transparent to your API call. HP will issue you a token, with an expiration. When that token expires, the client will automatically re-authenticate and retrieve a new token. The caller shouldn't have to worry about this happening.

#### Internal URLs

As part of the options, you can tell `pkgcloud` to use the Internal (Service Net) URLs for a service, if possible.

 ```Javascript
 var client = require('pkgcloud').storage.createClient({
     provider: 'hp',
     username: 'your-user-name',
     password: 'your-password',
     useInternal: true
 });
 ```

 This setting is explicit. If you set it to true, and you have no connectivity to the internal URL for a service, your connections will timeout.
