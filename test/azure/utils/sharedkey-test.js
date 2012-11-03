var SharedKey = require('../../../lib/pkgcloud/azure2/utils/sharedkey');
var request = require('request');
var xml2js = require('xml2js');

var sharedKey = new SharedKey('pkgcloudeast', 'Beo6e44qaiLdGjvFe+pS9SJFCJo6XNbDLQ2Xj5iDvvny/PD666S3dhwJYgtGQg2yNdtgX/iysnUMQu8PfJiNpA==');

var req = {
  uri: 'http://pkgcloudeast.blob.core.windows.net/?comp=list',
  path:['','?comp=list'],
  headers:{}
};

var options = {};
sharedKey.signRequest(req,options);


request(req, function (err, resp, body) {
  if (err) {
    console.log(err);
  } else {
    console.dir(resp.statusCode);
      console.dir(body);
  }
});