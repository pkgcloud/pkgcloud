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
    "pool_id": "c0d19bc6-d7c9-408a-825e-f1c9ef143b12",
    "delay": "1",
    "expected_codes": "200,201,202",
    "http_method": "GET",
    "max_retries": 5,
    "timeout": 1,
    "type": "HTTP",
    "url_path": "/index.html"
  };
  client.createHealthMonitorV2(options, function(err, item) {
    if (err) {
      console.log(err);
    }
    console.log(item);
  });
});
