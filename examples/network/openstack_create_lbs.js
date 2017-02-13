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
    'name': 'loadbalancer_unit_test',
    'description': 'simple loadbalancer',
    'project_id': KH_admin_tenantID,
    'tenant_id': KH_admin_tenantID,
    'vip_subnet_id': "33058db7-91bc-4a1b-857a-7f3447c3568c",
    'admin_state_up': false,
  };
  client.createLoadbalancer(options, function(err, lbs) {
    if (err) {
      console.log(err);
    }
    console.log(lbs);
  });
}
