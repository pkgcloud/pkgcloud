var pkgcloud = require('../../lib/pkgcloud');

var redis = pkgcloud.database.createClient({
  provider: 'redistogo',
  username: "bob",
  password: "1234"
});

//
// Create a redis
//
redis.create({
  plan: "nano",
}, function (err, result) {
  console.log(err, result);
  //
  // Get the same redis we just created
  //
  redis.get(result.id, function(err, result) {
    console.log(err, result);
    redis.remove(result.id, function(err, result) {
      console.log(err, result);
    });
  });
});