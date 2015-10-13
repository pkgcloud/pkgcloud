/*
 * lbaasPools.js: lbaas APIs
 * for Openstack network
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var lbaasPoolPath = '/lb/pools';


// Declaring variables for helper functions defined later
var _convertRouterToWireFormat;


/***

 list pool (Get)

***/

exports.getPools  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getlbaasOpts = {
    path: lbaasPoolPath,
  };
  this._request(getlbaasOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.pools || !(body.pools instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.pools.map(function (pools) {
      return new self.models.lbaasPools(self, pools);
    }));
  });
};

/**

  Pool show

*/

exports.getPool = function (option, callback) {
  var self = this,
    poolID = option instanceof this.models.lbaasPools ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas Pool', poolID);
  this._request({
    path: urlJoin(lbaasPoolPath, poolID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.pool) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.lbaasPools(self, body.pool));
  });
};

/**

  Pool create
  {
    "pool": {
      "admin_state_up": true,
      "description": "simple pool",
      "lb_method": "ROUND_ROBIN",
      "name": "pool1",
      "protocol": "HTTP",
      "subnet_id": "6c529c2b-22b8-4eae-b722-bc6338f6d1a8"
    }
  }
**/
exports.createPool = function (options, callback) {
  var self = this,
    pool = typeof options === 'object' ? options : { 'name' : options};

  pool_create = _convertPoolsToWireFormat(pool);

  var createPoolOpts = {
    method: 'POST',
    path: lbaasPoolPath,
    body: { 'pool' : pool_create}
  };

  self.emit('log::trace', 'Creating lbaas pool', pool);
  this._request(createPoolOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasPools(self, body.pool));
  });
};

/**
  Pool update
  {
    "admin_state_up": true,
    "description": "simple pool",
    "lb_method": "ROUND_ROBIN",
    "name": "pool1",
  }
**/

exports.updatePool = function (options, callback) {
  var self = this,
  poolID = options.id,
  poolUpdate = _convertPoolsUpdateToWireFormat(options);
  var updatePoolsOpts = {
    method: 'PUT',
    path: urlJoin(lbaasPoolPath, poolID),
    contentType: 'application/json',
    body: { 'pool' : poolUpdate }
  };
  self.emit('log::trace', 'Updating lbaas pools', poolID);
  this._request(updatePoolsOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasPools(self, body.pool));
  });
};


/*
    Pool delete

*/
exports.destroyPool = function (options, callback) {
  var self = this,
    poolID = options instanceof this.models.lbaasPools ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas pool', poolID);
  this._request({
    path: urlJoin(lbaasPoolPath, poolID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, poolID);
  });
};




/**

  Pool associate health monitor
  {
   "health_monitor":{
      "id":"b624decf-d5d3-4c66-9a3d-f047e7786181"
   }
}
**/
exports.associatePoolMonitor = function (options, callback) {
  var self = this,
    poolMonitor = typeof options === 'object' ? options : { 'name' : options},


  pool_create = _convertPoolsMonitorAssociationToWireFormat(poolMonitor);

  var createPoolOpts = {
    method: 'POST',
    path: urlJoin(lbaasPoolPath, poolMonitor.id+'/health_monitors'),
    body: { 'health_monitor' : pool_create}
  };

  self.emit('log::trace', 'lbaas pool associate health monitor', poolMonitor.id);
  this._request(createPoolOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasPools(self, body.health_monitor));
  });
};


/**
  Pool delete health monitor
  input:
  {
     id: {pool_id},
     monitor_id: {health_monitor_id}
  }

  DELETE /v2.0/lb/pools/​{pool_id}​/health_monitors/​{health_monitor_id}​
**/

exports.disassociatePoolMonitor = function (options, callback) {
  var self = this,
    pool_id = typeof options === 'object' ? options.id : null,
    monitor_id = typeof options === 'object' ? options.monitor_id : null;
  self.emit('log::trace', 'lbaas pool dis-associate health monitor', pool_id);
  this._request({
    path: urlJoin(lbaasPoolPath, pool_id, 'health_monitors', monitor_id),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, pool_id);
  });
};




/*
  Convert message format for monitor association
*/
_convertPoolsMonitorAssociationToWireFormat = function (details){
  var wireFormat = {};
  if(typeof(details.monitor_id) == 'undefined')
  {
    wireFormat.id = null;
  }else
  {
    wireFormat.id = details.monitor_id;
  }
  return wireFormat;
};




/*
  Convert message format for update


*/
_convertPoolsUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up;
  wireFormat.description = details.description;
  wireFormat.lb_method = details.lb_method || 'ROUND_ROBIN';
  wireFormat.name = details.name;
  return wireFormat;
};

/*
  Convert message format for creation

  {
    "admin_state_up": true,
    "description": "simple pool",
    "lb_method": "ROUND_ROBIN",
    "name": "pool1",
    "protocol": "HTTP",
    "subnet_id": "6c529c2b-22b8-4eae-b722-bc6338f6d1a8"
  }
*/
_convertPoolsToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up;
  wireFormat.description = details.description;
  wireFormat.lb_method = details.lb_method || 'ROUND_ROBIN';
  wireFormat.subnet_id = details.subnet_id || null;
  wireFormat.name = details.name;
  wireFormat.protocol = details.protocol;

  return wireFormat;
};
