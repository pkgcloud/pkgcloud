/*
 * templates.js: Implementation template loader
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var fs = require('fs');
var PATH = require('path');

exports.loadTemplate = function(name, callback) {
  var path = PATH.join(__dirname, name);
  fs.readFile(path, 'utf8', function(err, data) {
    callback(err, data);
  });
};