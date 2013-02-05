# Using Rackspace with `pkgcloud`

* [Using Compute](#using-compute)
* [Using Storage](#using-storage)
* [Using Databases](#using-databases)

<a name="using-compute"></a>
## Using Compute

``` js
  var rackspace = pkgcloud.compute.createClient({
    provider: 'rackspace',
    username: 'nodejitsu',
    apiKey: 'foobar'
  });
```
### API Methods

**Servers**

#### client.getServers(callback)
Lists all servers that are available to use on your Rackspace account

Callback returns `f(err, servers)` where `servers` is an `Array`

#### client.createServer(options, callback)
Creates a server with the options specified

Options are as follows:

```js
{
  name: 'serverName', // required
  flavor: 'flavor1',  // required
  image: 'image1',    // required
  required: false,    // optional
  personality: []     // optional
}
```
Returns the server in the callback `f(err, server)`

#### client.destroyServer(server, callback)
Destroys the specified server

Takes server or serverId as an argument  and returns the id of the destroyed server in the callback `f(err, serverId)`

#### client.getServer(server, callback)
Gets specified server

Takes server or serverId as an argument and returns the server in the callback
`f(err, server)`

#### client.rebootServer(server, options, callback)
Reboots the specifed server with options

Options include:

```js
{
  type: 'HARD' // optional (defaults to 'SOFT')
}
```
Returns callback with a confirmation

#### client.getVersion(callback)

Get the current version of the api returned in a callback `f(err, version)`

#### client.getLimits(callback)

Get the current API limits returned in a callback `f(err, limits)`

**flavors**

#### client.getFlavors(callback)

Returns a list of all possible server flavors available in the callback `f(err,
flavors)`

#### client.getFlavor(flavor, callback)
Returns the specified rackspace flavor of Rackspace Images by ID or flavor
object in the callback `f(err, flavor)`

**images**

#### client.getImages(callback)
Returns a list of the images available for your account

`f(err, images)`

#### client.getImage(image, callback)
Returns the image specified

`f(err, image)`

#### client.createImage(options, callback)
Creates an Image based on a server

Options include:

```js
{
  name: 'imageName',  // required
  server: 'serverId'  // required
}
```

Returns the newly created image

`f(err, image)`

#### client.destroyImage(image, callback)
Destroys the specified image and returns a confirmation

`f(err, {ok: imageId})`

<a name="using-storage"></a>
## Using Storage

``` js
  var rackspace = pkgcloud.storage.createClient({
    provider: 'rackspace', // 'cloudservers'
    username: 'nodejitsu',
    apiKey: 'foobar'
  });
```

<a name="using-databases"></a>
## Using Databases

**Rackspace**

``` js
  var client = pkgcloud.database.createClient({
    provider: 'rackspace',
    username: 'bob',
    key: '124'
  });
```

The steps for provision a MySQL database from rackspace cloud databases are:

1. Choose a flavor (memory RAM size)
2. Create an instance of a database server.
3. When the instance is provisioned, create your database.

Also you can manage users across your instances and each instance can handle several databases.

``` js
  client.getFlavors(function (err, flavors) {
    //
  	// Look at the availables flavors for your instance
  	//
  	console.log(flavors);

  	//
    // Lets choose the ID 1 for 512MB flavor
    //
    client.getFlavor(1, function (err, flavor) {
      //
      // Create the instance for host the databases.
      //
      client.createInstance({
        name: 'test-instance',
        flavor: flavor,
        //
        // Optional, you can choose the disk size for the instance
        // (1 - 8) in GB. Default to 1
        //
        size: 3
        //
        // Optional, you can give an array of database names for initialize
        // when the instace is ready
        //
        databases: ['first-database', 'second-database']
      }, function (err, instance) {
        //
        // At this point when the instance is ready we can manage the databases
        //
        client.createDatabase({
          name: 'test-database',
          instance: instance
        }, function (err, database) {
          //
          // Log the result
          //
          console.log(database);
        });
      });
    })
  });
```
