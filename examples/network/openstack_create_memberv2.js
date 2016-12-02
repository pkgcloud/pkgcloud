var getToken = require('./get_openstack_token');
getToken.getToken(function (id){
  var pkgcloud = require('../../lib/pkgcloud');
  var KH_admin_tenantID = '6ade8ae8037b4e449a4c7c7a65dc5e1b';
  var client = pkgcloud.network.createClient({
    provider: 'openstack',
    tenantId: KH_admin_tenantID,
    token: id,
    region: 'RegionOne',
    authUrl: 'http://172.16.31.1:35357',
    strictSSL: false
  });


  var options = {
    "subnet_id": "33058db7-91bc-4a1b-857a-7f3447c3568c",
    "address": "196.168.99.123",
    "protocol_port": "443",
    "pool_id": "c0d19bc6-d7c9-408a-825e-f1c9ef143b12",
    "weight": "1"
  };
  client.createMemberV2(options, function(err, item) {
    if (err) {
      console.log(err);
    }
    console.log(item);
  });
});
