var pkgcloud = require('../../lib/pkgcloud');
var KH_admin_tenantID = '6ade8ae8037b4e449a4c7c7a65dc5e1b';
var client = pkgcloud.network.createClient({
  provider: 'openstack',
  tenantId: KH_admin_tenantID,
  token: 'f7fed2ba253641be8e761bee31278545',
  region: 'RegionOne',
  authUrl: 'http://172.16.31.1:35357',
  strictSSL: false
});


var options = 'd8d00cbd-7287-4e83-ba10-df08a0d6644d';
client.destroyPoolV2(options, function(err, listener) {
  if (err) {
    console.log(err);
  }
  console.log(listener);
});
