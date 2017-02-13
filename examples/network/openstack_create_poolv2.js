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
    "admin_state_up": true,
    "description": "simple pool",
    "lb_algorithm": "ROUND_ROBIN",
    "name": "my-pool",
    "protocol": "HTTP",
    "listener_id": "1ac1a152-3b9f-48d2-bab5-f0cb9f36292b"
  };
  client.createPoolV2(options, function(err, item) {
    if (err) {
      console.log(err);
    }
    console.log(item);
  });
});
