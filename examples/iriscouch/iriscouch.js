var pkgcloud = require('../../lib/pkgcloud');

var couch = pkgcloud.database.createClient({
  provider: 'iriscouch',
  username: "bob",
  password: "1234"
});

//
// Create a couch
//
couch.create({
  subdomain: "pkgcloud-nodejitsu-test-5",
  first_name: "pkgcloud",
  last_name: "pkgcloud",
  email: "info@nodejitsu.com"
}, function (err, result) {
  console.log(err, result);
  //
  // Check now exists @ http://pkgcloud-nodejitsu-test-5.iriscouch.com
  //
});
