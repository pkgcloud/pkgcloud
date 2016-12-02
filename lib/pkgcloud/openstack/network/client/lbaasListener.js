var urlJoin = require('url-join');

var lbaasListenersPath = '/lbaas/listeners';


// Declaring variables for helper functions defined later
var _convertListenersToWireFormat,
    _convertListenersUpdateToWireFormat;


/***

 list Listeners (Get)

***/

exports.getListeners  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getlbaasOpts = {
    path: lbaasListenersPath,
  };
  this._request(getlbaasOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.listeners || !(body.listeners instanceof Array)) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, body.listeners.map(function (lbs) {
                          return new self.models.lbaasListeners(self, lbs);
                         }));
  });
};

/**

  listener show

*/

exports.getListener = function (option, callback) {
  var self = this,
    listenerID = option instanceof this.models.lbaasListeners ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas listener', listenerID);
  this._request({
    path: urlJoin(lbaasListenersPath, listenerID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.listener) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasListeners(self, body.listener));
  });
};

/**

  Listeners create
  {
    "listener": {
      "admin_state_up": true,
      "connection_limit": 100,
      "description": "listener one",
      "loadbalancer_id": "a36c20d0-18e9-42ce-88fd-82a35977ee8c",
      "name": "listener1",
      "protocol": "HTTP",
      "protocol_port": "80",
      "default_tls_container_ref": "https://barbican.endpoint/containers/a36c20d0-18e9-42ce-88fd-82a35977ee8c",
      "sni_container_refs": [
        "https://barbican.endpoint/containers/b36c20d0-18e9-42ce-88fd-82a35977ee8d",
        "https://barbican.endpoint/containers/c36c20d0-18e9-42ce-88fd-82a35977ee8e"
      ]
    }
  }
**/
exports.createListener = function (options, callback) {
  var self = this,
    listener = typeof options === 'object' ? options : { 'name' : options};

  var listener_create = _convertListenersToWireFormat(listener);
  var createLoadbalancerOpts = {
    method: 'POST',
    path: lbaasListenersPath,
    body: { 'listener' : listener_create}
  };

  self.emit('log::trace', 'Creating lbaas listener', listener);
  this._request(createLoadbalancerOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.listener) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasListeners(self, body.listener));
  });
};

/**
{
  "listener": {
    "admin_state_up": false,
    "connection_limit": 200,
    "description": "listener two",
    "name": "listener2",
    "default_tls_container_ref": "https://barbican.endpoint/containers/a36c20d0-18e9-42ce-88fd-82a35977ee8c",
    "sni_container_refs": [
      "https://barbican.endpoint/containers/b36c20d0-18e9-42ce-88fd-82a35977ee8d",
      "https://barbican.endpoint/containers/c36c20d0-18e9-42ce-88fd-82a35977ee8e"
    ]
  }
}
**/

exports.updateListener = function (options, callback) {
  var self = this,
  listenerID = options.id,
  listenerUpdate = _convertListenersUpdateToWireFormat(options);
  var updateListenersOpts = {
    method: 'PUT',
    path: urlJoin(lbaasListenersPath, listenerID),
    contentType: 'application/json',
    body: { 'listener' : listenerUpdate }
  };
  self.emit('log::trace', 'Updating lbaas listener', listenerID);
  this._request(updateListenersOpts, function (err,body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.listener) {
      return callback(new Error('Malformed API Response'));
    }
    return callback(err, new self.models.lbaasListeners(self, body.listener));
  });
};


/*
    Listener delete

*/
exports.destroyListener = function (options, callback) {
  var self = this,
    listenerID = options instanceof this.models.lbaasListeners ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas listener', listenerID);
  this._request({
    path: urlJoin(lbaasListenersPath, listenerID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    return err
    ? callback(err)
    : callback(err, listenerID);
  });
};

/*
  Convert message format for update
*/
_convertListenersUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.name = details.name;
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.connection_limit = details.connection_limit;
  wireFormat.description = details.description;
  wireFormat.default_tls_container_id = details.default_tls_container_id;
  wireFormat.sni_container_id = details.sni_container_id;
  return wireFormat;
};

/*
  Convert message format for creation

  {
    "name": "Listener1",
    "description": "simple lb",
    "project_id": "b7c1a69e88bf4b21a8148f787aef2081",
    "tenant_id": "b7c1a69e88bf4b21a8148f787aef2081",
    "vip_subnet_id": "013d3059-87a4-45a5-91e9-d721068ae0b2",
    "vip_address": "10.0.0.4",
    "admin_state_up": true,
    "flavor": "a7ae5d5a-d855-4f9a-b187-af66b53f4d04"
  }
*/
_convertListenersToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.name = details.name;
  wireFormat.description = details.description;
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.connection_limit = details.connection_limit || -1;
  wireFormat.loadbalancer_id = details.loadbalancer_id;
  wireFormat.protocol = details.protocol;
  wireFormat.protocol_port = details.protocol_port;
  if (details.protocol === 'TERMINATED_HTTPS'){
    wireFormat.default_tls_container_id =  details.default_tls_container_id;
    wireFormat.sni_container_id = details.sni_container_id;
  }
  wireFormat.default_pool_id = details.default_pool_id;
  return wireFormat;
};
