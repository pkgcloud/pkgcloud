/*
 * checks.js: Rackspace monitoring client checks functionality
 *
 * (C) 2014 Rackspace
 *      Justin Gallardo
 * MIT LICENSE
 *
 */

var urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    Entity = pkgcloud.providers.rackspace.monitoring.Entity,
    Check = pkgcloud.providers.rackspace.monitoring.Check;

var _getUrlPrefix = function(entityId) {
  return ['entities', entityId, 'checks'].join('/');
};

exports.getChecks = function (entity, options, callback) {
  var self = this;
      entityId = entity instanceof Entity ? entity.id : entity,
      requestOptions = {
        path: _getUrlPrefix(entityId)
  };

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  self._request(requestOptions, function (err, body, res) {
    console.log('body');
    console.dir(body);
    if (err) {
      return callback(err);
    }

    else if (!body || !body.values) {
      return callback(new Error('Unexpected empty response'));
    }

    else {
      return callback(null, body.values.map(function (check) {
        return new Check(self, check);
      }));
    }
  });
};


exports.getCheck = function (entity, check, callback) {
  var self = this,
      entityId = entity instanceof Entity ? entity.id : entity,
      checkId = check instanceof Check ? check.id : check,
      requestOptions = {
    path: urlJoin(_getUrlPrefix(entityId), checkId)
  };

  self._request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    else if (!body) {
      return callback(new Error('Unexpected empty response'));
    }

    else {
      return callback(null, new Check(self, body));
    }
  });
};
