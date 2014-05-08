##Using the Openstack Network provider

Creating a client is straight-forward:

``` js
  var openstack = pkgcloud.network.createClient({
    provider: 'openstack',
    username: 'your-user-name',
    password: 'your-password',
    authUrl: 'https://your-identity-service'
  });
```
### API Methods

**Networks**

#### client.getNetworks(callback)
Lists all networks that are available to use on your Openstack account

Callback returns `f(err, networks)` where `networks` is an `Array`

#### client.createNetwork(options, callback)
Creates a network with the options specified

Options are as follows:

```js
{
  name: 'networkName', // optional
  admin_state_up : true,  // optional
  shared : true,    // optional, Admin only
  tenant_id : '<tenant-id>'     // optional, Admin only
}
```
Returns the network in the callback `f(err, network)`

#### client.updateNetwork(options, callback)
Updates a network with the options specified

Options are as follows:

```js
{
  id : '<network-id>', // required
  name: 'networkName', // optional
  admin_state_up : true,  // optional
  shared : true,    // optional, Admin only
  tenant_id : '<tenant-id>'     // optional, Admin only
}
```
Returns the network in the callback `f(err, network)`

#### client.destroyNetwork(network, callback)
Destroys the specified network

Takes network or networkId as an argument  and returns the id of the destroyed network in the callback `f(err, networkId)`

#### client.getNetwork(network, callback)
Gets specified network

Takes network or networkId as an argument and returns the network in the callback
`f(err, network)`
