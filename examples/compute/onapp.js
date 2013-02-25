var pkgcloud = require('../../lib/pkgcloud');


var otherClient = pkgcloud.compute.createClient({
  provider: 'onapp',
  username: 'your-account', 
  password: 'your-password',
  serversUrl: 'https://'
});