var pkgcloud = require('../../lib/pkgcloud');

var rackspace = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: 'nodejitsu',
  apiKey: 'foobar'
});
