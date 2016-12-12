var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('lodash');

exports.resolve = function (templateName, params, callback) {
  var identityTemplate;
  var paramsTemplate;
  async.waterfall([
    function (next) {
      load(templateName + '.identity.json', next);
    },
    function (loadedTemplate, next) {
      identityTemplate = loadedTemplate;
      load(templateName + '.params.json', next);
    },
    function (loadedTemplate, next) {
      // compile template with params
      paramsTemplate = loadedTemplate;
      var compiledIdentity = _.template(identityTemplate);
      var compiledParams = _.template(paramsTemplate);
      var identity = JSON.parse(compiledIdentity(params));
      var parameters = JSON.parse(compiledParams(params));
      next(null, identity, parameters);
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