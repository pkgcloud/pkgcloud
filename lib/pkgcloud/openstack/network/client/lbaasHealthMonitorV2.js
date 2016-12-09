var urlJoin = require('url-join');

var lbaasMonitorPath = '/lbaas/healthmonitors';


// Declaring variables for helper functions defined later
var _convertMonitorsToWireFormat,
    _convertMonitorsUpdateToWireFormat;


/***

 list Health Monitors (Get)

***/

exports.getHealthMonitorsV2  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getMonitorOpts = {
    path: lbaasMonitorPath,
  };
  this._request(getMonitorOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.healthmonitors || !(body.healthmonitors instanceof Array)) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, body.healthmonitors.map(function (monitor) {
                          return new self.models.healthMonitorV2(self, monitor);
                         }));
  });
};

/**

  Health Monitor show

*/

exports.getHealthMonitorV2 = function (option, callback) {
  var self = this,
    healthMonitorId = option instanceof this.models.healthMonitorV2 ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas health monitor', healthMonitorId);
  this._request({
    path: urlJoin(lbaasMonitorPath, healthMonitorId),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.healthmonitor) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.healthMonitorV2(self, body.healthmonitor));
  });
};

/**

  health monitor create
  {
      "healthmonitor": {
          "pool_id": "74aa2010-a59f-4d35-a436-60a6da882819",
          "admin_state_up": true,
          "delay": "1",
          "expected_codes": "200,201,202",
          "http_method": "GET",
          "max_retries": 5,
          "timeout": 1,
          "type": "HTTP",
          "url_path": "/index.html"
      }
  }
**/
exports.createHealthMonitorV2 = function (options, callback) {
  var self = this,
    monitor = typeof options === 'object' ? options : { 'name' : options};

  var monitor_create = _convertMonitorsToWireFormat(monitor);
  console.log(monitor_create);
  var createLoadbalancerOpts = {
    method: 'POST',
    path: lbaasMonitorPath,
    body: { 'healthmonitor' : monitor_create}
  };

  self.emit('log::trace', 'Creating lbaas health monitor', monitor_create);
  this._request(createLoadbalancerOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.healthmonitor) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.healthMonitorV2(self, body.healthmonitor));
  });
};

/**
{
    "healthmonitor": {
        "admin_state_up": false,
        "delay": "2",
        "expected_codes": "200",
        "http_method": "POST",
        "max_retries": 2,
        "timeout": 2,
        "url_path": "/page.html"
    }
}
**/

exports.updateHealthMonitorV2 = function (options, callback) {
  var self = this,
  monitorId = options.id,
  monitorUpdate = _convertMonitorsUpdateToWireFormat(options);
  var updateMonitorsOpts = {
    method: 'PUT',
    path: urlJoin(lbaasMonitorPath, monitorId),
    contentType: 'application/json',
    body: { 'healthmonitor' : monitorUpdate }
  };
  self.emit('log::trace', 'Updating lbaas health monitor', monitorId);
  this._request(updateMonitorsOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.healthmonitor) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.healthMonitorV2(self, body.healthmonitor));
  });
};


/*
    health delete

*/
exports.destroyHealthMonitorV2 = function (options, callback) {
  var self = this,
    monitorId = options instanceof this.models.healthMonitorV2 ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas health monitor', monitorId);
  this._request({
    path: urlJoin(lbaasMonitorPath, monitorId),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    return err
    ? callback(err)
    : callback(err, monitorId);
  });
};

/*
  Convert message format for update
  {
    "healthmonitor": {
        "admin_state_up": false,
        "delay": "2",
        "expected_codes": "200",
        "http_method": "POST",
        "max_retries": 2,
        "timeout": 2,
        "url_path": "/page.html"
    }
  }
*/
_convertMonitorsUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.delay = details.delay;
  wireFormat.expected_codes = details.expected_codes;
  wireFormat.http_method = details.http_method;
  wireFormat.max_retries = details.max_retries;
  wireFormat.timeout = details.timeout;
  wireFormat.url_path = details.url_path;
  return wireFormat;
};

/*
  Convert message format for creation

  {
    "pool_id": "74aa2010-a59f-4d35-a436-60a6da882819",
    "admin_state_up": true,
    "delay": "1",
    "expected_codes": "200,201,202",
    "http_method": "GET",
    "max_retries": 5,
    "timeout": 1,
    "type": "HTTP",
    "url_path": "/index.html"
  }
*/
_convertMonitorsToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.pool_id = details.pool_id;
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.delay = details.delay;
  wireFormat.expected_codes = details.expected_codes;
  wireFormat.http_method = details.http_method;
  wireFormat.max_retries = details.max_retries;
  wireFormat.timeout = details.timeout;
  wireFormat.type = details.type;
  wireFormat.url_path = details.url_path;
  return wireFormat;
};
