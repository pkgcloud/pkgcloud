var util = require('util'),
    model = require('../base/model');

var lbaasListener = exports.lbaasListener = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasListener, model.Model);
