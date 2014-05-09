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

#### client.getNetwork(network, callback)
Gets specified network

Takes network or networkId as an argument and returns the network in the callback
`f(err, network)`

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

**Subnets**

#### client.getSubnets(callback)
Lists all subnets that are available to use on your Openstack account

Callback returns `f(err, subnets)` where `subnets` is an `Array`

#### client.getSubnet(subnet, callback)
Gets specified subnet

Takes subnet or subnetId as an argument and returns the subnet in the callback
`f(err, subnet)`

#### client.createSubnet(options, callback)
Creates a subnet with the options specified

Options are as follows:

```js
{
  name: 'subnetName', // optional
  network_id : '<network-id>',  // required, The ID of the attached network.
  shared : true,    // optional, Admin only
  tenant_id : '<tenant-id>'     // optional, The ID of the tenant who owns the network. Admin-only
  gateway_ip : 'gateway ip address', // optional,The gateway IP address.
  enable_dhcp : true // Set to true if DHCP is enabled and false if DHCP is disabled.
}
```
Returns the subnet in the callback `f(err, subnet)`

#### client.updateSubnet(options, callback)
Updates a subnet with the options specified

Options are as follows:

```js
{
  id : '<subnet-id>', // required
  name: 'subnetName', // optional
  network_id : '<network-id>',  // required, The ID of the attached network.
  shared : true,    // optional, Admin only
  tenant_id : '<tenant-id>'     // optional, The ID of the tenant who owns the network. Admin-only
  gateway_ip : 'gateway ip address', // optional,The gateway IP address.
  enable_dhcp : true // Set to true if DHCP is enabled and false if DHCP is disabled.
}
```
Returns the subnet in the callback `f(err, subnet)`

#### client.destroySubnet(subnet, callback)
Destroys the specified subnet

Takes subnet or subnetId as an argument  and returns the id of the destroyed subnet in the callback `f(err, subnetId)`
