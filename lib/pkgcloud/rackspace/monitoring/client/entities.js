/*
 * entities.js: Rackspace monitoring client entities functionality
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
    Entity = pkgcloud.providers.rackspace.monitoring.Entity;

var _urlPrefix = 'entities';

exports.getEntities = function (options, callback) {
  var self = this;
      requestOptions = {
        path: _urlPrefix
  };

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  self._request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    else if (!body || !body.values) {
      return callback(new Error('Unexpected empty response'));
    }

    else {
      return callback(null, body.values.map(function (entity) {
        return new Entity(self, entity);
      }));
    }
  });
};


exports.getEntity = function (entity, callback) {
  var self = this,
      entityId = entity instanceof Entity ? entity.id : entity,
      requestOptions = {
    path: urlJoin(_urlPrefix, entityId)
  };

  self._request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    else if (!body) {
      return callback(new Error('Unexpected empty response'));
    }

    else {
      return callback(null, new Entity(self, body));
    }
  });
};
