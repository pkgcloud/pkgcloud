var pkgcloud = require('../../lib/pkgcloud');


var client = pkgcloud.compute.createClient({
  provider: 'onapp',
  username: 'your_email', 
  password: 'api_key',
  serversUrl: 'http://127.0.0.1'
});

//getServer
client.getServer("gahi7dcway9qb0", function (err, server) {
  console.log(server);
});

//setVersion
client.getVersion(function (err, version) {
  console.log(version);
});

//createServer
var options = {
  hostname: 'tests.tests.com',
  template_id: '6',
};

client.createServer(options, function (err, server) {
  console.log(server);
});

//getServers
client.getServers(function (err, servers) {
  servers[0].destroy(function(err, server){
    console.log(server);
  });
});
