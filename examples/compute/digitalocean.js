var pkgcloud = require('../../lib/pkgcloud'),
  client,
  options;

//
// Create a pkgcloud compute instance
//
options = {
    provider: 'digitalocean',
    token: 'digitalocean-api-token'
};
client = pkgcloud.compute.createClient(options);

//
// List DigitalOcean Droplets.
//
client.getServers(function (err, servers) {
  if (err) {
    console.error(err);
  }

  servers.forEach(function (server) {
    console.log(server.name, server.id, server.status);
  });
});


//
// Create a Droplet and wait until finished.
//
options = {
  name:  'pkgcloud-test',
  flavor: '512mb',
  image: 'ubuntu-14-04-x64',
  ipv6: true,
  private_networking: true,
  backups: true
};

client.createServer(options, function (err, server) {
  if (err) {
    console.log(err);
  } else {
    // Wait for the server to reach the RUNNING state.
    console.log('waiting for server RUNNING state...');
    server.setWait({ status: server.STATUS.running }, 10000, function (err, server) {
      if (err) {
        console.log(err);
      } else {
        console.dir(server);
      }
    });
  }
});