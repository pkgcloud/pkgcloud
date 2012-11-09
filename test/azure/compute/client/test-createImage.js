//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');

var fs = require('fs');
var async = require('async');

var client = helpers.createClient('azure2', 'compute');

var options = {
  name: "test-reboot",
  server: "test-reboot"
};

client.createImage(options, function(err, result) {
  if(err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});

