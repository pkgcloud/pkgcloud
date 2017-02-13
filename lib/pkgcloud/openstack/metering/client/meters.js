/*
 * meters.js: Methods for working with meters from Openstack Ceilometer
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 *
 */
var Meter      = require('../meter').Meter,
    oldSample  = require('../oldsample').oldSample,
    Statistic  = require('../statistic').Statistic,
    urlJoin    = require('url-join'),
    QStringify = require('../utils/utils.js');

var _urlPrefix = 'meters';

/**
 * client.getMeters
 *
 * @description Get the meters for an account
 * @param options           Query Filter parameters
 * @param {function}        callback
 * @returns  [*]
 */
exports.getMeters = function (options, callback) {
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
      return new Meter(self, data);
      }), res);
  });
};

/**
 * client.getMeter
 *
 * @description Get the details for the provided meter
 *
 * @param options
 * @param options.meterName Meter name      The name of the meter you want to see
 * @param options.qs        Query parameters for more info see the utils/utils.js file
 * @param {function}        callback
 * @returns [*]
 */
exports.getMeter = function (options, callback) {
  var self = this;
    //meter_id = options instanceof Meter ? options.meter_id : options,

  var requestOptions = {
    path : urlJoin(self.version,_urlPrefix, options.meterName)
  };

  if (options && options.qs) {
    requestOptions.path = urlJoin(requestOptions.path, QStringify.stringify(options.qs));
  }

  return self._request(requestOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.map(function (data) {
      return new oldSample(self, data);
      }), res);
  });
};

/**
 * client.createMeter
 *
 * @description Creates a meter (whend doesn't exist) and stores the provided samples
 *
 * @param options.meterName     string   the name for the new meter
 * @param options.samples       [samples]
 *
 * @param {function}            callback
 */
exports.createMeter = function (options, callback) {
  var self = this;

  var createOptions = {
    method: 'POST',
    path: urlJoin(self.version, _urlPrefix, options.meterName),
    body: options.samples
  };

  self._request(createOptions, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.map(function (x) {
      return new oldSample(self, x);
      }));
  });
};


/**
 * client.getMeterStats
 *
 * @description Get the statistics for the provided meter
 *
 * @param options
 * @param options.meterName Meter name      The name of the meter you want to see
 * @param options.qs        Query parameters for more info see the utils/utils.js file & API info
 * @param {function}        callback
 * @returns [*]
 */
exports.getMeterStats = function (options, callback) {
  var self = this;
  //meter_id = options instanceof Meter ? options.meter_id : options,

  var requestOptions = {
    path : urlJoin(self.version,_urlPrefix, options.meterName, 'statistics')
  };

  if (options && options.qs) {
    requestOptions.path = urlJoin(requestOptions.path, QStringify.stringify(options.qs));
  }

  return self._request(requestOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.map(function (data) {
      return new Statistic(self, data);
      }), res);
  });
};

