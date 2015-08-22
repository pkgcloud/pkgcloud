//TODO: Make this a vows test

var templates = require('../../../../lib/pkgcloud/azure/compute/templates/templates');
var _ = require('lodash');

var params = {
  HOSTNAME: 'pkgcloud1',
  USERNAME: 'pkgcloud',
  PASSWORD: 'pkgcloud!!',
  SSH_CERTIFICATE_FINGERPRINT: '123456789'
};

templates.load('linuxConfigSet.xml', function (err, template) {
  if (err) {
    console.dir(err);
  } else {

    var compiled = _.template(template);
    console.log(compiled(params));
  }
});
