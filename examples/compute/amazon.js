var pkgcloud = require('../../lib/pkgcloud');

var client = pkgcloud.compute.createClient({
  provider: 'amazon',
  accessKey: 'asdfkjas;dkj43498aj3n',
  accessKeyId: '98kja34lkj'
});

client.getServers(function (err, servers) {
  if (err) {
    console.error(err);
  }

  servers.forEach(function (server) {
    console.log(server.toJSON());
  });
});
