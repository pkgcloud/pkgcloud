var pkgcloud = require('../../lib/pkgcloud');

var client = pkgcloud.network.createClient({
  provider: 'openstack',
  tenantId: 'e7a1864d6a9348f3a94fd32e3ebd1a36',
  token: 'f0ff40891f3f4e4bbb550621ebcfffc5',
  region: 'RegionOne',
  authUrl: 'http://controller:5000/',
  strictSSL: false
});


var options = {
  'name': 'loadbalancer_unit_test2',
  'description': 'simple loadbalancer',
  'project_id': 'e7a1864d6a9348f3a94fd32e3ebd1a36',
  'tenant_id': 'e7a1864d6a9348f3a94fd32e3ebd1a36',
  'vip_subnet_id': "82dbbff7-e1c6-4fcf-a766-128c363c7f69",
  'admin_state_up': false,
};
client.createLoadbalancer(options, function(err, lbs) {
  if (err) {
    console.log(err);
  }
  console.log(lbs);
});
