var pkgcloud = require('../../lib/pkgcloud');
var KH_admin_tenantID = '6ade8ae8037b4e449a4c7c7a65dc5e1b';
getToken.getToken(function (id){
  var client = pkgcloud.network.createClient({
    provider: 'openstack',
    tenantId: KH_admin_tenantID,
    token: id,
    region: 'RegionOne',
    authUrl: 'http://172.16.31.1:35357',
    strictSSL: false
  });
  var options = {
    'name': 'listener_unit_test_updated',
    'description': 'simple listener updated',
    'connection_limit': 111655,
    'admin_state_up': false,
    'id': '1ac1a152-3b9f-48d2-bab5-f0cb9f36292b',
    'default_tls_container_id': 'http://192.168.100.11:9311/v1/containers/e243f5ba-1754-45ad-87e7-3102d5739a76'
  };
  client.updateListener(options, function(err, listener) {
    if (err) {
      console.log(err);
    }
    console.log(listener);
  });
});
