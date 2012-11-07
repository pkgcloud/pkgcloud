/*
 * templates.js: Implementation template loader
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var fs = require('fs');
var PATH = require('path');

exports.load = function(name, callback) {
  var path = PATH.join(__dirname, name);
  fs.readFile(path, 'utf8', function(err, data) {
    callback(err, data);
  });
};

