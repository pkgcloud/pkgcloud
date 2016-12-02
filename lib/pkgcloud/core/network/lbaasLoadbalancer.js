var util = require('util'),
    model = require('../base/model');

var lbaasLoadbalancer = exports.lbaasLoadbalancer = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasLoadbalancer, model.Model);
