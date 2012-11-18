# Using IrisCouch with `pkgcloud`

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