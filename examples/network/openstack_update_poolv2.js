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
    'name': 'pool_test_updated',
    'description': 'simple pool updated',
    'admin_state_up': false,
    'id': 'd8d00cbd-7287-4e83-ba10-df08a0d6644d',
    'lb_algorithm': 'LEAST_CONNECTIONS'
  };
  client.updatePoolV2(options, function(err, listener) {
    if (err) {
      console.log(err);
    }
    console.log(listener);
  });
});
