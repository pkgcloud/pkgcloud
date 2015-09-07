/*
 * statistic.js: OpenStack Ceilometer meters
 *
 * (C) 2015 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _ = require('underscore');

var Statistic = exports.Statistic = function Statistic(client, details) {
    base.Model.call(this, client, details);
};

util.inherits(Statistic, base.Model);

Statistic.prototype._setProperties = function (details) {
    this.avg = details.avg;
    this.count = details.count;
    this.duration = details.duration;
    this.duration_end = details.duration_end;
    this.duration_start = details.duration_start;
    this.max = details.max;
    this.min = details.min;
    this.period = details.period;
    this.period_end = details.period_end;
    this.period_start = details.period_start;
    this.sum = details.sum;
    this.unit = details.unit;
};

Statistic.prototype.toJSON = function () {
    return _.pick(this, ['avg', 'count', 'duration', 'duration_end', 'duration_start', 'max', 'min', 'period', 'period_end', 'period_start', 'sum', 'unit']);
};


