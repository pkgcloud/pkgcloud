//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');

var fs = require('fs');
var async = require('async');

var client = helpers.createClient('azure', 'compute');

var options = {
  name: "pkgcloud1",
  server: "pkgcloud1"
};

client.createImage(options, function(err, result) {
  if(err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});

