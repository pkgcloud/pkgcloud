# RedisToGo

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