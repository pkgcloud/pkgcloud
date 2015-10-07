/*
 * opLoadBalancer.js: lbaas APIs
 * for Openstack networking
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var lbaasPath = '/lb';
var lbaasVipPath = '/lb/vips';
var lbaasHealthMonitorPath = '/lb/health_monitors';

// Declaring variables for helper functions defined later
var _convertRouterToWireFormat;


/***

    Health monitor list (GET)


***/
exports.getHealthMonitors  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getlbaasOpts = {
    path: lbaasHealthMonitorPath,
  };
  this._request(getlbaasOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.health_monitors || !(body.health_monitors instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.health_monitors.map(function (lbaasvip) {
      return new self.models.HealthMonitor(self, lbaasvip);
    }));
  });
};

/**

  show vip

*/
exports.getHealthMonitor = function (option, callback) {
  var self = this,
    vipID = option instanceof this.models.HealthMonitor ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas VIP', vipID);
  this._request({
    path: urlJoin(lbaasHealthMonitorPath, vipID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.health_monitor) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.HealthMonitor(self, body.health_monitor));
  });
};
