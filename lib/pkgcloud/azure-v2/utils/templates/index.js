var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');

exports.resolve = function (templateName, params, callback) {
  async.waterfall([
    function (next) {
      load(templateName + '.json', next);
    },
    function (template, next) {
      // compile template with params
      var compiled = _.template(template);
      var result = JSON.parse(compiled(params));
      next(null, result);
    }
  ], callback);
}

var load = exports.load = function (templateName, callback) {
  var templatePath = path.join(__dirname, templateName);
  fs.readFile(templatePath, 'utf8', function (err, data) {
    callback(err, data);
  });
};

var compile = exports.compile = function (name, params, callback) {
  var path = PATH.join(__dirname, name);
  fs.readFile(path, 'utf8', function (err, data) {
    var compiled = _.template(data);
    callback(err, compiled(params));
  });
};