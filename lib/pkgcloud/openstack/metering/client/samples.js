/*
 * samples.js: Methods for working with samples from Openstack Ceilometer
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 *
 */
var Sample     = require('../sample').Sample,
    urlJoin    = require('url-join'),
    QStringify = require('../utils/utils.js');

var _urlPrefix = 'samples';

/**
 * client.getSamples
 *
 * @description Lists all known samples, based on the data recorded so far.
 * @param options           Query parameters for more info see the utils/utils.js file
 * @param {function}        callback
 * @returns  [Array]
 */
exports.getSamples = function (options, callback) {
  var self = this;

  var requestOptions = {
    path : urlJoin(self.version,_urlPrefix)
  };


  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  if (options) {
    requestOptions.path = urlJoin(requestOptions.path, QStringify.stringify(options));
  }

  return self._request(requestOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.map(function (data) {
      return new Sample(self, data);
      }), res);
  });
};

/**
 * client.getSample
 *
 * @description Shows a specific sample
 * @param sampleId          The id of the sample you want to consult
 * @param {function}        callback
 * @returns  [*]
 */
exports.getSample = function (sampleId, callback) {
  var self = this;

  var requestOptions = {
    path : urlJoin(self.version,_urlPrefix, sampleId)
  };

  return self._request(requestOptions, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Sample(self, body));
  });
};
