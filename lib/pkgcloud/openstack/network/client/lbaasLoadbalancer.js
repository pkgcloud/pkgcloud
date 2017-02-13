var urlJoin = require('url-join');

var lbaasLoadbalancerPath = '/lbaas/loadbalancers';


// Declaring variables for helper functions defined later
var _convertLoadbalancersToWireFormat,
    _convertLoadbalancersUpdateToWireFormat;


/***

 list loadbalancers (Get)

***/

exports.getLoadbalancers  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getlbaasOpts = {
    path: lbaasLoadbalancerPath,
  };
  this._request(getlbaasOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.loadbalancers || !(body.loadbalancers instanceof Array)) {
      return callback(new Error('Malformed API Response'));
    }
    return err
      ? callback(err)
      : callback(err, body.loadbalancers.map(function (lbs) {
          return new self.models.lbaasLoadbalancer(self, lbs);
        }));
  });
};

/**

  loadbalancer show

*/

exports.getLoadbalancer = function (option, callback) {
  var self = this,
    loadbalancerID = option instanceof this.models.lbaasLoadbalancer ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas loadbalancer', loadbalancerID);
  this._request({
    path: urlJoin(lbaasLoadbalancerPath, loadbalancerID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.loadbalancer) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasLoadbalancer(self, body.loadbalancer));
  });
};

/**

  Loadbalancers create
  {
    "loadbalancer": {
        "name": "loadbalancer1",
        "description": "simple lb",
        "project_id": "b7c1a69e88bf4b21a8148f787aef2081",
        "tenant_id": "b7c1a69e88bf4b21a8148f787aef2081",
        "vip_subnet_id": "013d3059-87a4-45a5-91e9-d721068ae0b2",
        "vip_address": "10.0.0.4",
        "admin_state_up": true,
        "flavor": "a7ae5d5a-d855-4f9a-b187-af66b53f4d04"
    }
  }
**/
exports.createLoadbalancer = function (options, callback) {
  var self = this,
    loadbalancer = typeof options === 'object' ? options : { 'name' : options};

  var loadbalancer_create = _convertLoadbalancersToWireFormat(loadbalancer);
  var createLoadbalancerOpts = {
    method: 'POST',
    path: lbaasLoadbalancerPath,
    body: { 'loadbalancer' : loadbalancer_create}
  };

  self.emit('log::trace', 'Creating lbaas loadbalancer', loadbalancer);
  this._request(createLoadbalancerOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.loadbalancer) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasLoadbalancer(self, body.loadbalancer));
  });
};

/**
  loadbalancer update
  {
      "loadbalancer": {
          "admin_state_up": false,
          "description": "simple lb2",
          "name": "loadbalancer2"
      }
  }
**/

exports.updateLoadbalancer = function (options, callback) {
  var self = this,
  loadbalancerID = options.id,
  loadbalancerUpdate = _convertLoadbalancersUpdateToWireFormat(options);
  var updateLoadbalancersOpts = {
    method: 'PUT',
    path: urlJoin(lbaasLoadbalancerPath, loadbalancerID),
    contentType: 'application/json',
    body: { 'loadbalancer' : loadbalancerUpdate }
  };
  self.emit('log::trace', 'Updating lbaas loadbalancer', loadbalancerID);
  this._request(updateLoadbalancersOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.loadbalancer) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasLoadbalancer(self, body.loadbalancer));
  });
};


/*
    Loadbalancer delete

*/
exports.destroyLoadbalancer = function (options, callback) {
  var self = this,
    loadbalancerID = options instanceof this.models.lbaasLoadbalancer ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas loadbalancer', loadbalancerID);
  this._request({
    path: urlJoin(lbaasLoadbalancerPath, loadbalancerID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    return err
    ? callback(err)
    : callback(err, loadbalancerID);
  });
};

/*
  Convert message format for update
*/
_convertLoadbalancersUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.description = details.description;
  wireFormat.name = details.name;
  return wireFormat;
};

/*
  Convert message format for creation

  {
    "name": "loadbalancer1",
    "description": "simple lb",
    "project_id": "b7c1a69e88bf4b21a8148f787aef2081",
    "tenant_id": "b7c1a69e88bf4b21a8148f787aef2081",
    "vip_subnet_id": "013d3059-87a4-45a5-91e9-d721068ae0b2",
    "vip_address": "10.0.0.4",
    "admin_state_up": true,
    "flavor": "a7ae5d5a-d855-4f9a-b187-af66b53f4d04"
  }
*/
_convertLoadbalancersToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.name = details.name;
  wireFormat.description = details.description;
  wireFormat.tenant_id = details.tenant_id;
  wireFormat.vip_subnet_id = details.vip_subnet_id;
  wireFormat.vip_address = details.vip_address || null;
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.subnet_id = details.flavor;
  return wireFormat;
};
