/*
 * record.js: Base record from which all pkgcloud dns record inherit from
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    model = require('../base/model');

var Record = exports.Record = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(Record, model.Model);
