var pkgcloud = require('../../lib/pkgcloud');

var irisCouch = pkgcloud.database.createClient({
  provider: 'iriscouch',
  username: "bob",
  password: "1234"
});

//
// Create a couch
//
irisCouch.create({
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

//
// Crate a redis database
//
irisCouch.create({
  subdomain: "pkgcloud-nodejitsu-test-6",
  first_name: "pkgcloud",
  last_name: "pkgcloud",
  email: "info@nodejitsu.com",
  // For redis instead of couch just put type to redis
  type: "redis",
  // AND ADD A PASSWORD! (required)
  password: "mys3cur3p4ssw0rd"
}, function (err, result) {
  console.log('HOST to connect:', result.host);
  console.log('KEY to use:', result.password);
  //
  // Check the connection, use result.host and result.password values
  //  redis-cli -h $RESULT.HOST -a $RESULT.PASSWORD
  //
});