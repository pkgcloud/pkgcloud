/*
 * templates.js: template loader
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var fs = require('fs');
var _ = require('lodash');

exports.load = function (path, callback) {
  fs.readFile(path, 'utf8', function (err, data) {
    callback(err, data);
  });
};

exports.compile = function (path, params, callback) {
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      callback(err);
    } else {
      var compiled = _.template(data);
      callback(null, compiled(params));
    }
  });
};
