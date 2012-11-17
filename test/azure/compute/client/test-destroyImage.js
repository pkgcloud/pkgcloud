//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');

var fs = require('fs');
var async = require('async');

var client = helpers.createClient('azure', 'compute');


client.destroyImage('pkgcloud1', function(err, result) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});

