##Using the Openstack CDN provider

Creating a client is straight-forward:

``` js
  var openstack = pkgcloud.cdn.createClient({
    provider: 'openstack', // required
    username: 'your-user-name', // required
    password: 'your-password', // required
    authUrl: 'your identity service url' // required
  });
```

[More options for creating clients](README.md)

### API Methods

## Base

#### `client.getHomeDocument(function (err, homeDocument) { })`
Retrieves the home document, which allows you to navigate the remainder of the
API. Callback is `f(err, homeDocument)` where `homeDocument` is an `Object`.

#### `client.getPing(function (err) { })`
Pings the server for any errors. Callback is `f(err)`.

## Services

#### client.createService(options, callback)
Creates a service with the options specified.

Options are as follows:

```js
{
  name: 'my-service-name', // name of service, required
  domains: [ ... ],        // list of domains for service, required
  origins: [ ... ],        // list of origins for service, required
  caching: [ ... ],        // list of caching rules for service, optional
  restrictions: [ ... ],   // list of restrictions on where service can be accessed from, optional
  flavorId: 'cdn'          // ID of CDN flavor to use, required
}
```
Callback is `f(err, service)`, where `service` is the created service.

#### client.getServices([options], callback)

Lists all created services. Callback is `f(err, services)` where `services`
is an `Array`.

#### client.getService(service, callback)

Retrieve the created service for the provided service or serviceName. Callback is `f(err,
service)`.

#### client.updateService(service, callback)

Update the provided service.

The following values from the provided service are updatable.

```js
{
  name: 'my-service-name', // name of service, required
  domains: [ ... ],        // list of domains for service, required
  origins: [ ... ],        // list of origins for service, required
  flavorId: 'cdn'          // ID of CDN flavor to use, required
}
```

#### client.deleteService(service, callback)

Delete the created service. Callback is `f(err)`.

## Service Assets

#### client.deleteServiceCachedAssets(service, assetUrl, callback)

Purge the service's cached asset (if `assetUrl` is specified) or all cached 
assets (if `assetUrl` is not specified). Callback is `f(err)`.

## Flavors

#### client.getFlavors(options, callback)

Lists all available CDN flavors. Callback is `f(err, flavors)` where
`flavors` is an Array.

#### client.getFlavor(flavor, callback)

Retrieve the CDN flavor for a provided flavor or flavorId. Callback is `f(err,
flavor)`.
