/*
 * zone.js: Base zone from which all pkgcloud dns zone inherit from
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    model = require('../base/model');

var Zone = exports.Zone = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(Zone, model.Model);
