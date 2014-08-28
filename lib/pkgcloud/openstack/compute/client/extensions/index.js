/*
 * index.js: OpenStack compute extension index
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 * (updated by Alvaro M. Reol)
 */

var util = require('util'),
    _ = require('underscore');

var extensions = {
  getExtensions: function(callback) {
    return this._request({
      path: 'extensions'
    }, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, body.extensions, res);
    });
  }
};

_.extend(extensions, require('./floating-ips'));
_.extend(extensions, require('./keys'));
_.extend(extensions, require('./networks'));
_.extend(extensions, require('./security-groups'));
_.extend(extensions, require('./security-group-rules'));
_.extend(extensions, require('./servers'));
_.extend(extensions, require('./volume-attachments'));

module.exports = extensions;
