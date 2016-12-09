var pkgcloud = require('../../lib/pkgcloud');
var KH_admin_tenantID = '6ade8ae8037b4e449a4c7c7a65dc5e1b';
var getToken = require('./get_openstack_token');
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
    'delay' : 10,
    'expected_codes': '400,401',
    'http_method': 'head',
    'max_retries': 9,
    'timeout': '13',
    'url_path': '/update',
    'id': '5f96c62f-71e6-4c9d-b397-c541f4fe2d69'
  };
  client.updateHealthMonitorV2(options, function(err, listener) {
    if (err) {
      console.log(err);
    }
    console.log(listener);
  });
});
