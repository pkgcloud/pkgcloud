# MongoHQ

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
