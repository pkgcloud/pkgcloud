var qs = require('qs');
var request = require('request');
var querystring = require('querystring');
var getToken = exports.getToken = function (callback) {
  var postData = JSON.stringify(
    {"auth":
     {"tenantName":"admin",
      "passwordCredentials":{
        "username": "admin",
        "password":"hbopsk_adminpass"
      }
    }
  });

  var options = {
    url: "http://172.16.31.1:35357/v2.0/tokens",
    headers: {
      'Content-Type': 'application/json'
    },
    body: postData
  };
  request.post(options, function(error, resp, body){
    console.log('token = ', JSON.parse(body).access.token.id);
    callback(JSON.parse(body).access.token.id);
  });

}
