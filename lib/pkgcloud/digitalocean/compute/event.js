var util = require('util'),
    base = require('../../core/base/model');

var Event = exports.Event = function (client, details) {
  base.Model.call(this, client, details);
};
util.inherits(Event, base.Model);

Event.prototype.refresh = function (callback) {
  var self = this;

  self.client.request({
    path: '/events/' + self.id
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    self._setProperties(body.event);
    callback(null, self);
  });
};

Event.prototype._setProperties = function (details) {
  this.id = details.id;
  this.status = details.action_status;
};
