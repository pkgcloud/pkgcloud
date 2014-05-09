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

**Ports**

#### client.getPorts(callback)
Lists all ports that are available to use on your Openstack account

Callback returns `f(err, ports)` where `ports` is an `Array`

#### client.getPort(port, callback)
Gets specified port

Takes port or portId as an argument and returns the port in the callback
`f(err, port)`

#### client.createPort(options, callback)
Creates a port with the options specified

Options are as follows:

```js
{
  name: 'portName', // optional
  admin_state_up : true,  // optional, The administrative status of the router. Admin-only
  network_id : '<network-id>',  // required, The ID of the attached network.
  status  : 'text status',    // optional, The status of the port.
  tenant_id : '<tenant-id>'     // optional, The ID of the tenant who owns the network. Admin-only
  mac_address: 'mac address'     // optional
  fixed_ips : ['ip address1', 'ip address 2'], // optional.
  security_groups : ['security group1', 'security group2'] // optional, Specify one or more security group IDs.
}
```
Returns the port in the callback `f(err, port)`

#### client.updatePort(options, callback)
Updates a port with the options specified

Options are as follows:

```js
{
  id : '<port-id>', // required
  name: 'portName', // optional
  admin_state_up : true,  // optional, The administrative status of the router. Admin-only
  network_id : '<network-id>',  // required, The ID of the attached network.
  status  : 'text status',    // optional, The status of the port.
  tenant_id : '<tenant-id>'     // optional, The ID of the tenant who owns the network. Admin-only
  mac_address: 'mac address'     // optional
  fixed_ips : ['ip address1', 'ip address 2'], // optional.
  security_groups : ['security group1', 'security group2'] // optional, Specify one or more security group IDs.
}
```
Returns the port in the callback `f(err, port)`

#### client.destroyPort(port, callback)
Destroys the specified port

Takes port or portId as an argument  and returns the id of the destroyed port in the callback `f(err, portId)`
