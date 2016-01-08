/*
 * alarms.js: Methods for working with alarms from Openstack Ceilometer
 *
 * (C) 2015 Hopebay Tech 
 * 
 * Rice Li
 *
 */
var Alarm = require('../alarm').Alarm,
    AlarmHistory = require('../alarmHistory').AlarmHistory,
    oldSample = require('../oldsample').oldSample,
    Statistic = require('../statistic').Statistic,
    urlJoin = require('url-join'),
    QStringify = require('../utils/utils.js');

var _urlPrefix = 'alarms';

/**
 * client.getAlarms
 *
 * @description Get the alarms for an account
 * @param options           Query Filter parameters
 * @param {function}        callback
 * @returns  [*]
 */
exports.getAlarms = function (options, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
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
            return new Alarm(self, data);
        }), res);
    });
};

/**
 * client.getAlarm
 *
 * @description Get the details for the provided alarm 
 *
 * @param options
 * @param options.alarmName Alarm name      The name of the alarm you want to see
 * @param options.qs        Query parameters for more info see the utils/utils.js file
 * @param {function}        callback
 * @returns [*]
 */
exports.getAlarm = function (options, callback) {
    var self = this,
        //alarm_id = options instanceof Alarm ? options.alarm_id : options,
        requestOptions;

    requestOptions = {
        path : urlJoin(self.version, _urlPrefix, options)
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Alarm(self, body));
    });
};

/**
 * client.createAlarm
 *
 * @description Creates a alarm (whend doesn't exist) and stores the provided samples
 *
 * @param options.alarmName     string   the name for the new alarm 
 * @param options.alarms       [samples]
 *
 * @param {function}            callback
 */
exports.createAlarm = function (options, callback) {
    var self = this,
        requestOptions;

    createOptions = {
        method: 'POST',
        path: urlJoin(self.version, _urlPrefix),
        body: options
    };

    return self._request(createOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Alarm(self, body));
    });
};

/**
 * client.updateAlarm
 *
 * @description Update a alarm
 * @param {function}            callback
 */
exports.updateAlarm = function (options, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        method: 'PUT',
        contentType: 'application/json',
        path: urlJoin(self.version, _urlPrefix, options.alarm_id),
        body: options
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Alarm(self, body));
    });
};

/**
 * client.destroyAlarm
 *
 * @description Deletes a alarm
 *
 * @param options.alarmName     string   the name for the new alarm 
 * @param options.alarms       [samples]
 *
 * @param {function}            callback
 */
exports.destroyAlarm = function (options, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        method: 'DELETE',
        path: urlJoin(self.version, _urlPrefix, options)
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Alarm(self, body));
        return callback(null, body);
    });
};

/**
 * client.getAlarmHistory
 *
 * @description Display the change history of an alarm.
 *
 * @param options           Alarm id
 * @param {function}        callback
 * @returns [*]
 */
exports.getAlarmHistory = function (options, callback) {
    var self = this,
        //alarm_id = options instanceof Alarm ? options.alarm_id : options,
        requestOptions;

    requestOptions = {
        path : urlJoin(self.version, _urlPrefix, options, 'history')
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, body.map(function (data) {
            return new AlarmHistory(self, data);
        }), res);
    });
};
