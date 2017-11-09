## Using the 1&1 Load Balancer provider

#### BETA - This API may change as additional providers for load balancers are added to pkgcloud

### Table of Contents

* LoadBalancer
  * [Model](#loadbalancer-model)
  * [Managing Load Balancers](#loadbalancer-apis)
  * [Nodes](#nodes)
* Node 
  * [Model](#node-model)

### Getting Started

Creating a loadbalancer client is straight-forward:

``` js
  var oneandone = pkgcloud.loadbalancer.createClient({
    provider: 'oneandone', // required
    token: 'your-api-key' // required
   });
```

*[More options for creating clients](README.md)*

Once you have a client, creating a load balancer is straight-forward.

```Javascript
oneandone.createLoadBalancer({
            name: 'lb test',
            healthCheckInterval: 40,
            Persistence: true,
            persistenceTime: 1200,
            method: oneandone.LoadBalancerMethod.ROUND_ROBIN,
            rules: [
              {
                protocol: 'TCP',
                port_balancer: 80,
                port_server: 80,
                source: '0.0.0.0'
              }
            ],
            location: '4EFAD5836CE43ACA502FD5B99BEE44EF'
          }, function(err, loadBalancer) {
  // use your new loadBalancer here
});
```

### LoadBalancer Model

A LoadBalancer has following properties:

```Javascript
{
  "id": "13C3F75BA55AF28B8B2B4E508786F48B",
  "name": "My Load Balancer 1",
  "ip": "70.35.192.35",
  "healthCheckTest": "TCP",
  "healthCheckInterval": 15,
  "persistence": true,
  "persistenceTime": 1200,
  "datacenter": {
    "id": "908DC2072407C94C8054610AD5A53B8C",
    "country_code": "US",
    "location": "United States of America"
  },
  "rules": [
    {
      "id": "E7CC65B301050BA1722F19EE0B08F1DB",
      "protocol": "TCP",
      "port_balancer": 90,
      "port_server": 90,
      "source": "0.0.0.0"
    }
  ],
  "nodes": [{  
  "id": "8808D9603ED0001D97F70854EDE3C195",
  "ip": "212.227.202.122",
  "server_name": "create-test-oao"
}]
}
```

**Proxy Methods**

An instance of a `LoadBalancer` has a number of convenience proxy methods. For example:

```Javascript
client.getNodes(loadBalancer, function(err, nodes) { ... };

// is equivalent to

loadBalancer.getNodes(function(err, nodes) { ... };
```

View the [complete list of LoadBalancer proxy methods](#loadbalancer-proxy-methods).

### Node Model

A Node for LoadBalancer has the following properties:

```Javascript
{  
  "id": "8808D9603ED0001D97F70854EDE3C195",
  "ip": "212.227.202.122",
  "server_name": "create-test-oao"
}
```

### LoadBalancer APIs

#### client.getLoadBalancers(options, callback)
Lists all loadbalancers available to your account.

Callback returns `f(err, loadbalancers)` where `loadbalancers` is an `Array`. `options` is an optional and unused argument at this time.

#### client.getLoadBalancer(loadBalancer, callback)
Gets specified LoadBalancer.

Takes `loadBalancer` or `loadBalancerId` as an argument and returns the `loadBalancer` in the callback
`f(err, loadBalancer)`

#### client.createLoadBalancer(details, callback)

The following JS object provides a brief overview of required and optional parameters for the `createLoadBalancer` `details` argument:

```js
{
  name: 'lb test',
  healthCheckInterval: 40,
  Persistence: true,
  persistenceTime: 1200,
  method: oneandone.LoadBalancerMethod.ROUND_ROBIN,
  rules: [
    {
      protocol: 'TCP',
      port_balancer: 80,
      port_server: 80,
      source: '0.0.0.0'
    }
  ],
  location: '4EFAD5836CE43ACA502FD5B99BEE44EF'
}
```

Returns the new LoadBalancer in the callback `f(err, loadBalancer)`

#### client.updateLoadBalancer(loadBalancer, callback)
Updates the `name`, `healthCheckInterval`, `healthCheckPath`, `Persistence`, `persistenceTime` and `method` properties of the provided `loadBalancer`.

Returns callback with `f(err)`.

#### client.deleteLoadBalancer(loadBalancer, callback)
Deletes the specified `loadBalancer`.

Takes `loadBalancer` or `loadBalancerId` as an argument and returns an error if unsuccessful `f(err)`

### Nodes

A `Node` represnets serverIPs added to a load balancer. When you setup load balancers serverIPs are loaded as nodes.

#### client.getNodes(loadBalancer, callback)

Returns a list of the servers/IPs attached to a load balancer.

Callback is `f(err, nodes)`.

#### client.addNodes(loadBalancer, nodes, callback)

Assigns servers/IPs to a load balancer.

##### Node Details
```Javascript
{
  serverIps=[ip1,ip2],
  loadbalancer = _loadBalancer
}
```

Callback is `f(err, nodes)`.

#### client.removeNode(loadBalancer, node, callback)

Remove a `node` from the provided `loadBalancer`. Takes `loadBalancer` or `loadBalancerId` as an argument. `node` should be either the `node` or `nodeId`.

Callback is `f(err)`.

### LoadBalancer Proxy Methods

##### loadBalancer.getNodes(callback)
##### loadBalancer.addNodes(nodes, callback)
##### loadBalancer.removeNode(node, callback)