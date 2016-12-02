var pkgcloud = require('../../lib/pkgcloud');
var KH_admin_tenantID = '6ade8ae8037b4e449a4c7c7a65dc5e1b';
var client = pkgcloud.network.createClient({
  provider: 'openstack',
  tenantId: KH_admin_tenantID,
  token: '4308c7c3b36b409191e6a74eb3eb6eac',
  region: 'RegionOne',
  authUrl: 'http://172.16.31.1:35357',
  strictSSL: false
});


var options = 'c0cd6ef8-444e-4182-b50e-fefcb8200300';
client.getPoolV2(options, function(err, listener) {
  if (err) {
    console.log(err);
  }
  console.log(listener);
});
