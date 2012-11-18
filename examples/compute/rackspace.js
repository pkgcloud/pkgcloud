var pkgcloud = require('../../lib/pkgcloud');

var rackspace = pkgcloud.compute.createClient({
  provider: 'rackspace',
  username: 'nodejitsu',
  apiKey: 'foobar'
});
