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

  show Health Monitor

*/
exports.getHealthMonitor = function (option, callback) {
  var self = this,
    monitorID = option instanceof this.models.HealthMonitor ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas health monitor', monitorID);
  this._request({
    path: urlJoin(lbaasHealthMonitorPath, monitorID),
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


/*
  create Health monitor
  {
    "health_monitor":{
      "admin_state_up": true,
      "delay": "1",
      "expected_codes": "200,201,202",
      "http_method": "GET",
      "max_retries": 5,
      "pool_id": "74aa2010-a59f-4d35-a436-60a6da882819",
      "timeout": 1,
      "type": "HTTP",
      "url_path": "/index.html"
    }
  }
*/

exports.createHealthMonitor = function (options, callback) {
  var self = this,
    monitor = typeof options === 'object' ? options : {};

  monitor_create = _convertcreateToWireFormat(monitor);

  var creatmonitorOpts = {
    method: 'POST',
    path: lbaasHealthMonitorPath,
    body: { 'health_monitor' : monitor_create}
  };

  self.emit('log::trace', 'Creating Health Monitor', monitor);
  this._request(creatmonitorOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.HealthMonitor(self, body.health_monitor));
  });
};


/*
  update Health monitor 

*/
exports.updateHealthMonitor = function (options, callback) {
  var self = this,
    monitor = typeof options === 'object' ? options : {};

  monitor_update = _convertupdateToWireFormat(monitor);

  var updateMonitorOpts = {
    method: 'PUT',
    path: urlJoin(lbaasHealthMonitorPath, monitor.id),
    contentType: 'application/json',
    body: { 'health_monitor' : monitor_update}
  };
  self.emit('log::trace', 'update health monitor', monitor);
  this._request(updateMonitorOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.HealthMonitor(self, body.health_monitor));
  });
};

/*
  Delete Health monitor
*/

exports.destroyHealthMonitor = function (options, callback) {
  var self = this,
    monitorID = options instanceof this.models.HealthMonitor ? options.id : options;
  console.log(urlJoin(lbaasHealthMonitorPath, monitorID));
  self.emit('log::trace', 'Deleting lbaas health monitor', monitorID);
  this._request({
    path: urlJoin(lbaasHealthMonitorPath, monitorID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, monitorID);
  });
};


/*
  Convert update
*/

_convertupdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.delay = details.delay || null;
  wireFormat.timeout = details.timeout || null;
  wireFormat.max_retries = details.max_retries || null;
  wireFormat.http_method  = details.http_method || null;
  wireFormat.url_path = details.url_path || null;
  wireFormat.expected_codes = details.expected_codes || null; 
  return wireFormat;
};



/*
  convert create to wire format
*/

_convertcreateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.type = details.type || null;
  wireFormat.delay = details.delay || null;
  wireFormat.timeout = details.timeout || null;
  wireFormat.max_retries = details.max_retries || null;
  if(wireFormat.type === 'HTTP' || wireFormat.type === 'HTTPS')
  {
    wireFormat.http_method  = details.http_method || null;
    wireFormat.url_path = details.url_path || null;
    wireFormat.expected_codes = details.expected_codes || null;
  }
  return wireFormat;
};

























