/*
 * reports.js: Instance methods for working with reports from Cloudkitty
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 *
 */
var _ = require('underscore');
var urlJoin = require('url-join');

var _urlPrefix = 'v1';

/**
 * client.getReportTotal
 *
 * @description Get the total costs for an tenant
 *
 * @param {object|Function}   options
 * @param {Date|String}       [options.begin]          the start time for the query
 * @param {Date|String}       [options.end]            the end time for the query
 * @param {String}            [options.tenant_id]      tenant id
 * @param {Function}          callback
 */
exports.getReportTotal = function (options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getReportTotalOpts = {
    path: urlJoin(_urlPrefix, 'report/total'),
    qs: _.pick(options, ['begin', 'end', 'tenant_id'])
  };

  this._request(getReportTotalOpts, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body);
  });
};
