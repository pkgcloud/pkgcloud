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
    'name': 'listener_unit_test',
    'description': 'simple listener',
    'project_id': KH_admin_tenantID,
    'tenant_id': KH_admin_tenantID,
    'connection_limit': 10000,
    'admin_state_up': false,
    'loadbalancer_id': 'c62ee7d5-6578-4eba-8932-621ffaedd117',
    'protocol': 'TERMINATED_HTTPS',
    'protocol_port': 443,
    'default_tls_container_id': 'http://192.168.100.11:9311/v1/containers/32cbdbe9-9613-430d-9c14-3785d5f99074',
    'default_pool_id': 'my-pool'
  };
  client.createListener(options, function(err, listener) {
    if (err) {
      console.log(err);
    }
    console.log(listener);
  });
});
