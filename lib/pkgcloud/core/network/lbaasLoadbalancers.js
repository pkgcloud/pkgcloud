var util = require('util'),
    model = require('../base/model');

var lbaasLoadbalancers = exports.lbaasLoadbalancers = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasLoadbalancers, model.Model);
