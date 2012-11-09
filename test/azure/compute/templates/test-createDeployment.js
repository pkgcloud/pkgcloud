//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');
var templates = require('../../../../lib/pkgcloud/azure/compute/templates/templates');
var _ = require('underscore');

var fs = require('fs');

var params = {
  NAME: 'moe',
  OS_CONFIG_SET: 'foobar'
};

templates.load('deploymentConfig.xml', function(err, template) {
  if(err) {
    console.dir(err);
  } else {
    var params = {
      NAME: 'moe',
      OS_CONFIG_SET: 'foobar'
    };

    console.log(_.template(template, params));
  }
});
