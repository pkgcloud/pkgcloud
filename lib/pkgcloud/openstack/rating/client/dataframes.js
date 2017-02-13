/*
 * dataframes.js: Instance methods for working with DataFrame from Cloudkitty
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 *
 */
var DataFrame = require('../dataframe').DataFrame,
    _ = require('underscore');
var urlJoin = require('url-join');

var _urlPrefix = 'v1';

/**
 * client.getDataFrames
 *
 * @description Get the dataframes for an tenant
 *
 * @param {object|Function}   options
 * @param {Date|String}       [options.begin]          the start time for the query
 * @param {Date|String}       [options.end]            the end time for the query
 * @param {String}            [options.tenant_id]      tenant id
 * @param {String}            [options.resource_type]  type of resource
 * @param {Function}          callback
 */
exports.getDataFrames = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getDataFramesOpts = {
    path: urlJoin(_urlPrefix, 'storage/dataframes'),
    qs: _.pick(options, ['begin', 'end', 'tenant_id', 'resource_type'])
  };

  this._request(getDataFramesOpts, function (err, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, body.dataframes.map(function (data) {
      return new DataFrame(self, data);
    }));
  });
};
