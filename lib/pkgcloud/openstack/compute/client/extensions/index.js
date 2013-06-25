/*
 * index.js: OpenStack compute extension index
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile');

var extensions = {
  getExtensions: function(callback) {
    return this.request({
      path: 'extensions'
    }, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, body.extensions, res);
    });
  }
};

utile.mixin(extensions, require('./volume-attachments'));
utile.mixin(extensions, require('./keys'));

module.exports = extensions;
