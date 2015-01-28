var fs = require('fs'),
    path = require('path'),
    pkgcloud = require('../../lib/pkgcloud');

//
// Joyent requires a username / password or key / keyId combo.
// key/keyId should be registered in Joyent servers.
// check `test/helpers/index.js` for details on key/keyId works.
//
var client = pkgcloud.compute.createClient({
  provider: 'joyent',
  account: 'nodejitsu',
  keyId: '/nodejitsu1/keys/dscape',
  key: fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'), 'ascii')
});

client.getServers(function (err, servers) {
  if (err) {
    console.error(err);
  }

  servers.forEach(function (server) {
    console.log(server.toJSON());
  });
});

//
// Alternatively create a client with a username / password pair
//
var otherClient = pkgcloud.compute.createClient({
  provider: 'joyent',
  username: 'your-account', 
  password: 'your-password'
});

otherClient.getServers(function (err, servers) {
  if (err) {
    console.error(err);
  }

  servers.forEach(function (server) {
    console.log(server.toJSON());
  });
});

