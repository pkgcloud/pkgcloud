/*
 * dataframe.js: OpenStack rating(cloudkitty) dataframe
 *
 * (C) 2015 HopebayTech
 *      Julian Liu
 * MIT LICENSE
 *
 */

 var util = require('util'),
     base = require('../../core/base'),
     _ = require('underscore');

 var DataFrame = exports.DataFrame = function DataFrame(client, details) {
   base.Model.call(this, client, details);
 };

 util.inherits(DataFrame, base.Model);

 DataFrame.prototype._setProperties = function (details) {
   this.begin = details.begin;
   this.end = details.end;
   this.tenantId = details.tenantId || details['tenant_id'];
   // RatedResource list
   this.resources = details.resources;
 };

 DataFrame.prototype.toJSON = function () {
   return _.pick(this, ['begin', 'end', 'tenantId', 'resources']);
 };
