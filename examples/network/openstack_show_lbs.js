var pkgcloud = require('../../lib/pkgcloud');
getToken.getToken(function (id){
  var client = pkgcloud.network.createClient({
    provider: 'openstack',
    tenantId: id,
    token: 'f0ff40891f3f4e4bbb550621ebcfffc5',
    region: 'RegionOne',
    authUrl: 'http://controller:5000/',
    strictSSL: false
  });
  var options = '50d3f823-cccb-471d-a82d-d7c03a4208a6';

  client.getLoadbalancer(options, function (err, lbs) {
    if (err) {
      console.log(err);
    } else {
      console.log(lbs);
    }
  });
});
