## Using the Rackspace Network provider

Creating a client is straight-forward:

``` js
  var rackspace = pkgcloud.network.createClient({
    provider: 'rackspace', // required
    username: 'your-user-name', // required
    apiKey: 'your-api-key', // required
    region: 'IAD', // required, regions can be found at
    // http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });
```

[More options for creating clients](README.md)

### API Methods

## Networks

#### client.getNetworks(callback)
Lists all networks that are available to use on your HP Cloud account

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
  adminStateUp : true,  // optional
  shared : true,    // optional, Admin only
  tenantId : 'tenantId'     // optional, Admin only
}
```
Returns the network in the callback `f(err, network)`

#### client.updateNetwork(options, callback)
Updates a network with the options specified

Options are as follows:

```js
{
  id : 'networkId', // required
  name: 'networkName', // optional
  adminStateUp : true,  // optional
  shared : true,    // optional, Admin only
  tenantId : 'tenantId'     // optional, Admin only
}
```
Returns the network in the callback `f(err, network)`

#### client.destroyNetwork(network, callback)
Destroys the specified network

Takes network or networkId as an argument  and returns the id of the destroyed network in the callback `f(err, networkId)`

## Subnets

#### client.getSubnets(callback)
Lists all subnets that are available to use on your HP Cloud account

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
  networkId : 'networkId',  // required, The ID of the attached network.
  shared : true,    // optional, Admin only
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the network. Admin-only
  gatewayIp : 'gateway ip address', // optional,The gateway IP address.
  enableDhcp : true // Set to true if DHCP is enabled and false if DHCP is disabled.
}
```
Returns the subnet in the callback `f(err, subnet)`

#### client.updateSubnet(options, callback)
Updates a subnet with the options specified

Options are as follows:

```js
{
  id : 'subnetId', // required
  name: 'subnetName', // optional
  networkId : 'networkId',  // required, The ID of the attached network.
  shared : true,    // optional, Admin only
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the network. Admin-only
  gatewayIp : 'gateway ip address', // optional,The gateway IP address.
  enableDhcp : true // Set to true if DHCP is enabled and false if DHCP is disabled.
}
```
Returns the subnet in the callback `f(err, subnet)`

#### client.destroySubnet(subnet, callback)
Destroys the specified subnet

Takes subnet or subnetId as an argument  and returns the id of the destroyed subnet in the callback `f(err, subnetId)`

## Ports

#### client.getPorts(callback)
Lists all ports that are available to use on your HP Cloud account

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
  adminStateUp : true,  // optional, The administrative status of the router. Admin-only
  networkId : 'networkId',  // required, The ID of the attached network.
  status  : 'text status',    // optional, The status of the port.
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the network. Admin-only
  macAddress: 'mac address'     // optional
  fixedIps : ['ip address1', 'ip address 2'], // optional.
  securityGroups : ['security group1', 'security group2'] // optional, Specify one or more security group IDs.
}
```
Returns the port in the callback `f(err, port)`

#### client.updatePort(options, callback)
Updates a port with the options specified

Options are as follows:

```js
{
  id : 'portId', // required
  name: 'portName', // optional
  adminStateUp : true,  // optional, The administrative status of the router. Admin-only
  networkId : 'networkId',  // required, The ID of the attached network.
  status  : 'text status',    // optional, The status of the port.
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the network. Admin-only
  macAddress: 'mac address'     // optional
  fixedIps : ['ip address1', 'ip address 2'], // optional.
  securityGroups : ['security group1', 'security group2'] // optional, Specify one or more security group IDs.
}
```
Returns the port in the callback `f(err, port)`

#### client.destroyPort(port, callback)
Destroys the specified port

Takes port or portId as an argument  and returns the id of the destroyed port in the callback `f(err, portId)`

**Security Groups**

#### client.getSecurityGroups(callback)
Lists all security groups that are available to use on your Openstack account

Callback returns `f(err, securityGroups)` where `securityGroups` is an `Array`

#### client.getSecurityGroup(securityGroup, callback)
Gets specified security group

Takes securityGroup or securityGroupId as an argument and returns the security group in the callback
`f(err, securityGroup)`

#### client.createSecurityGroup(options, callback)
Creates a security group with the options specified

Options are as follows:

```js
{
  name: 'securityGroupName', // required, name of security group
  description : 'security group description',  // optional, description of security group
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the security group. Admin-only
}
```
Returns the created security group in the callback `f(err, securityGroup)`

#### client.destroySecurityGroup(securityGroup, callback)
Destroys the specified security group

Takes securityGroup or securityGroupId as an argument  and returns the id of the destroyed security group in the callback `f(err, securityGroupId)`

**Security Group Rules**

#### client.getSecurityGroupRules(callback)
Lists all security group rules that are available to use on your Openstack account

Callback returns `f(err, securityGroupRules)` where `securityGroupRules` is an `Array`

#### client.getSecurityGroupRule(securityGroupRule, callback)
Gets specified security group rule

Takes securityGroupRule or securityGroupRuleId as an argument and returns the security group rule in the callback
`f(err, securityGroupRule)`

#### client.createSecurityGroupRule(options, callback)
Creates a security group rule with the options specified

Options are as follows:

```js
{
  securityGroupId: 'securityGroupId', // required, The security group ID to associate with this security group rule.
  direction: 'ingress|egress', // required, The direction in which the security group rule is applied.
  ethertype: 'IPv4|IPv6', // optional,
  portRangeMin: portNumber, // optional, The minimum port number in the range that is matched by the security group rule.
  portRangeMax: portNumber, // optional, The maximum port number in the range that is matched by the security group rule.
  protocol: 'tcp|udp|icmp', // optional, The protocol that is matched by the security group rule
  remoteGroupId: 'remote group id', // optional, The remote group ID to be associated with this security group rule. You can specify either this or remoteIpPrefix.
  remoteIpPrefix: 'remote IP prefix', // optional, The remote IP prefix to be associated with this security group rule. You can specify either this or remoteGroupId.
  tenantId : 'tenantId'     // optional, The ID of the tenant who owns the security group rule. Admin-only
}
```
Returns the created security group rule in the callback `f(err, securityGroupRule)`

#### client.destroySecurityGroupRule(securityGroupRule, callback)
Destroys the specified security group rule

Takes securityGroupRule or securityGroupRuleId as an argument  and returns the id of the destroyed security group rule in the callback `f(err, securityGroupRuleId)`
