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
