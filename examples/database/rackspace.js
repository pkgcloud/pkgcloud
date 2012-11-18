var pkgcloud = require('../../lib/pkgcloud');

var rackspaceClient = pkgcloud.database.createClient({
  provider: 'rackspace',
  username: 'bob',
  key: '124'
});

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