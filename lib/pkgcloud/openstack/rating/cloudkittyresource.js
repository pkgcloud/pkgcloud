/*
 * cloudkittyresource.js: OpenStack rating(cloudkitty) cloudkittyresource
 *
 * (C) 2015 HopebayTech
 *      Julian Liu
 * MIT LICENSE
 *
 */

 var util = require('util'),
     base = require('../../core/base'),
     _ = require('underscore');

 var CloudkittyResource = exports.CloudkittyResource = function CloudkittyResource(client, details) {
   base.Model.call(this, client, details);
 };

 util.inherits(CloudkittyResource, base.Model);

 CloudkittyResource.prototype._setProperties = function (details) {
   this.service = details.service;
   this.desc = details.desc;
   this.volume = details.volume;
 };

 CloudkittyResource.prototype.toJSON = function () {
   return _.pick(this, ['service', 'desc', 'volume']);
 };
