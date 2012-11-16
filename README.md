# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Unified Vocabulary](#unified-vocabulary)
* [Services](#components)
  * [Compute](#compute)
    * [Creating Compute Clients](#creating-compute-clients)
    * [Server](#server)
    * [Image](#image)
    * [Flavor](#flavor)
  * [Storage](#storage)
    * [Creating Storage Clients](#creating-storage-clients)
    * [Container](#container)
    * [Uploading Files](#uploading)
    * [Downloading Files](#downloading)
  * [Database](#database)
    * [Creating Storage Clients](#creating-storage-clients)
* [Roadmap](#next-steps)

<a name="Unified Vocabulary"></a>
## Unified Vocabulary

When considering all IaaS providers as a whole their vocabulary is somewhat disjoint. `pkgcloud` attempts to overcome this through a unified vocabulary. Note that all Database providers use the same vocabulary: _database_.

### Compute

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Joyent</th>
    <th>Amazon</th>
    <th>Rackspace</th>
  </tr>
  <tr>
    <td>Server</td>
    <td>Server</td>
    <td>Machine</td>
    <td>Instance</td>
    <td>Server</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>Image</td>
    <td>Dataset</td>
    <td>AMI</td>
    <td>Image</td>
  </tr>
  <tr>
    <td>Flavor</td>
    <td>Flavor</td>
    <td>Package</td>
    <td>InstanceType</td>
    <td>Flavor</td>
  </tr>
</table>

### Storage

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Amazon</th>
    <th>Rackspace</th>
  </tr>
  <tr>
    <td>Container</td>
    <td>Container</td>
    <td>Bucket</td>
    <td>Container</td>
  </tr>
  <tr>
    <td>File</td>
    <td>StorageObject</td>
    <td>Object</td>
    <td>File</td>
  </tr>
</table>

<a name="services"></a>
## Services

Currently there are several service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

<a name="compute"></a>
### Compute

<a name="creating-compute-clients"></a>
#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.Client` object should be:

**Rackspace**

``` js
  var rackspace = pkgcloud.compute.createClient({
    provider: 'rackspace',
    username: 'nodejitsu',
    apiKey: 'foobar'
  });
```

**Amazon**

``` js
  var amazon = pkgcloud.compute.createClient({
    provider: 'amazon',
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  });
```

**Joyent**

``` js
  var path = require('path'),
      fs   = require('fs');

  //
  // Joyent requires a username / password or key / keyId combo.
  // key/keyId should be registered in Joyent servers.
  // check `test/helpers/index.js` for details on key/keyId works.
  //
  var joyent = pkgcloud.compute.createClient({
    provider: 'joyent',
    account: 'nodejitsu'
    keyId: '/nodejitsu1/keys/dscape',
    key: fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'), 'ascii')
  });
```

<a name="server"></a>
#### Server
* `client.getServers(function (err, servers) { })`
* `client.createServer(options, function (err, server) { })`
* `client.destroyServer(serverId, function (err, server) { })`
* `client.getServer(serverId, function (err, server) { })`
* `client.rebootServer(server, function (err, server) { })`

<a name="image"></a>
#### Image
* `client.getImages(function (err, images) { })`
* `client.getImage(imageId, function (err, image) { })`
* `client.destroyImage(image, function (err, ok) { })`
* `client.createImage(options, function (err, image) { })`

<a name="flavor"></a>
#### Flavor
* `client.getFlavors(function (err, flavors) { })`
* `client.getFlavor(flavorId, function (err, flavor) { })`

<a name="storage"></a>
### Storage

<a name="creating-storage-clients"></a>
#### Creating Storage Clients
The options to be passed to the `pkgcloud.storage.Client` object should be:

**Rackspace**

``` js
  {
    provider: 'rackspace', // 'cloudservers'
    username: 'nodejitsu',
    apiKey: 'foobar'
  }
```

**AWS**

``` js
  {
    provider: 'amazon', // 'aws', 's3'
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  }
```

* `pkgcloud.storage.create(options, callback)`
* `new pkgcloud.storage.Client(options, callback)`

<a name="database"></a>
### Databases

<a name="creating-databases-clients"></a>
#### Creating Databases Clients
The options to be passed to the `pkgcloud.database.createClient` object should be:

**IrisCouch**

For use this service you will need a created and valid account. The important thing is the `username` and `password` for the `createClient()` method. But for IrisCouch creation method there is other required fields like `first_name`, `last_name`, `subdomain` and `email`

``` js
var irisClient = pkgcloud.database.createClient({
  provider: 'iriscouch',
  username: 'bob',
  password: '1234'
});

//
// Create a couch
//
irisClient.create({
  subdomain: 'pkgcloud-nodejitsu-test-7',
  first_name: 'pkgcloud',
  last_name: 'pkgcloud',
  email: 'info@nodejitsu.com'
}, function (err, result) {
  console.log(err, result);
  //
  // Check now exists @ http://pkgcloud-nodejitsu-test-7.iriscouch.com
  //
});
```
IrisCouch also provide a way to provision a redis database, in that case just pass the option `type: 'redis'` to the `create()` method and put a `password` for the access.

``` js
//
// Crate a redis database
//
irisClient.create({
  subdomain: 'pkgcloud-nodejitsu-test-7',
  first_name: 'pkgcloud',
  last_name: 'pkgcloud',
  email: 'info@nodejitsu.com',
  // For redis instead of couch just put type to redis
  type: 'redis',
  // AND ADD A PASSWORD! (required)
  password: 'mys3cur3p4ssw0rd'
}, function (err, result) {
  console.log('HOST to connect:', result.host);
  console.log('KEY to use:', result.password);
  //
  // Check the connection, use result.host and result.password values
  //  redis-cli -h $RESULT.HOST -a $RESULT.PASSWORD
  //
});
```

* `new pkgcloud.database.createClient(options, callback)`
* `pkgcloud.database.create(options, callback)`

**MongoLab**

The MongoLab API has a better aproach for manage the databases, they have implemented accounts for users, and each account could be provision databases. For create a database with MongoLab you will need first create an account and then use the created account as "owner" of the database.

``` js
// First lets set up the client
var MongoLabClient = pkgcloud.database.createClient({
  provider: 'mongolab',
  username: 'bob',
  password: '1234'
});
```

``` js
// Now lets create an account
// name and email are required fields.
MongoLabClient.createAccount({
  name:'daniel',
  email:'daniel@nodejitsu.com',
  // If you want, you can set your own password 
  // (Password must contain at least one numeric character.)
  // if not mongolab will create a password for you.
  password:'mys3cur3p4ssw0rd'
}, function (err, user) {
  // Now you can provision databases under this user account
  console.log(user);
});
```

``` js
// Now lets create a database
// name and owner are required fields
MongoLabClient.create({
  name:'myDatabase',
  // You need to put the exact name account returned in the account creation.
  owner: user.account.username
}, function (err, database) {
  // That is all
  console.log(database);
});
```

* `new pkgcloud.database.createClient(options, callback)`

#### Accounts
* `pkgcloud.database.createAccount(options, callback)`
* `pkgcloud.database.getAccounts(callback)`
* `pkgcloud.database.getAccount(name, callback)`
* `pkgcloud.database.deleteAccount(name, callback)`

#### Databases
* `pkgcloud.database.create(options, callback)`
* `pkgcloud.database.getDatabases(owner, callback)`
* `pkgcloud.database.getDatabase(options, callback)`
* `pkgcloud.database.remove(options, callback)`

**MongoHQ**

``` js
var MongoClient = pkgcloud.database.createClient({
  provider: 'mongohq',
  username: 'bob',
  password: '1234'
});

//
// Create a MongoDB
//
MongoClient.create({
  name: 'mongo-instance',
  plan: 'free',
}, function (err, result) {
  console.log(err, result);
  //
  // Now delete that same mongodb
  //
  MongoClient.remove(result.id, function(err, result) {
    console.log(err, result);
  });
});
```

* `new pkgcloud.database.createClient(options, callback)`
* `pkgcloud.database.create(options, callback)`
* `pkgcloud.database.remove(id, callback)`

**Rackspace**

``` js
var rackspaceClient = pkgcloud.database.createClient({
  provider: 'rackspace',
  username: 'bob',
  key: '124'
});
```

The steps for provision a MySQL database from rackspace cloud databases are: Choose a flavor (memory RAM size) and create an instace, when the instance is provisioned create your database. Also you can manage users across your instances and each instance can handle several databases.

``` js
rackspaceClient.getFlavors(function (err, flavors) {
  // Look at the availables flavors for your instance
  console.log(flavors);
  // Lets choose the ID 1 for 512MB flavor
  rackspaceClient.getFlavor(1, function (err, flavor) {
    // Create the instance for host the databases.
    rackspaceClient.createInstance({
      name: 'test-instance',
      flavor: flavor,
      // Optional, you can choose the disk size for the instance (1 - 8) in GB
      size: 3 // Default to 1
      // Optional, you can give an array of database names for initialize when the instace is ready
      databases: ['first-database', 'second-database']
    }, function (err, instance) {
      //
      // At this point when the instance is ready we can manage the databases
      //
      rackspaceClient.createDatabase({
        name: 'test-database',
        instance: instance
      }, function (err, database) {
        console.log(database);
      });
    });
  })
});

```

**RedisToGO**

``` js
var redisClient = pkgcloud.database.createClient({
  provider: 'redistogo',
  username: 'bob',
  password: '1234'
});

//
// Create a redis
//
redis.create({
  plan: 'nano',
}, function (err, result) {
  console.log(err, result);
  //
  // Get the same redis we just created
  //
  redis.get(result.id, function(err, result) {
    console.log(err, result);
    //
    // Remove the redis created
    //
    redis.remove(result.id, function(err, result) {
      console.log(err, result);
    });
  });
});
```

* `new pkgcloud.database.createClient(options, callback)`
* `pkgcloud.database.create(options, callback)`
* `pkgcloud.database.remove(id, callback)`
* `pkgcloud.database.get(id, callback)`

<a name="roadmap"></a>
## Roadmap

1. Add support for additional IaaS providers (Azure, etc)
2. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
3. 

#### Author: [Nodejitsu](http://nodejitsu.com)
#### License: MIT