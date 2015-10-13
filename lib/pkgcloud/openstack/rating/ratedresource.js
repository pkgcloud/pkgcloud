/*
 * ratedresource.js: OpenStack rating(cloudkitty) ratedresource
 *
 * (C) 2015 HopebayTech
 *      Julian Liu
 * MIT LICENSE
 *
 */

 var util = require('util'),
     base = require('../../core/base'),
     _ = require('underscore');

 var RatedResource = exports.RatedResource = function RatedResource(client, details) {
   base.Model.call(this, client, details);
 };

 util.inherits(RatedResource, base.Model);

 RatedResource.prototype._setProperties = function (details) {
   this.service = details.service;
   this.desc = details.desc;
   this.volume = details.volume;
   this.rating = details.rating;
 };

 RatedResource.prototype.toJSON = function () {
   return _.pick(this, ['service', 'desc', 'volume', 'rating']);
 };
