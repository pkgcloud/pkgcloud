var pkgcloud = require('../../lib/pkgcloud');

var mongodb = pkgcloud.database.createClient({
  provider: 'mongohq',
  username: "bob",
  password: "1234"
});

//
// Create a MongoDB
//
mongodb.create({
  name: "mongo-instance",
  plan: "free",
}, function (err, result) {
  console.log(err, result);
  //
  // Now delete that same MongoDB
  //
  mongodb.destroy(result.id, function(err, result) {
    console.log(err, result);
  });
});



