/*
 * router.js: Instance methods for working with neutron routers
 * for Openstack networking
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var routersResourcePath = '/routers';

// Declaring variables for helper functions defined later
var _convertRouterToWireFormat,
    _convertAddInterfaceFormat,
    _convertRouterUpdateToWireFormat;


/***

 list Router (Get)

***/

exports.getRouters  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getRouterOpts = {
    path: routersResourcePath
  };
  this._request(getRouterOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.routers || !(body.routers instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.routers.map(function (routers) {
      return new self.models.Router(self, routers);
    }));
  });
};


/*** 

    show router (Get)

***/

exports.getRouter = function (router, callback) {
  var self = this,
    routerID = router instanceof this.models.Router ? router.id : router;
  self.emit('log::trace', 'Getting details for network', routerID);
  this._request({
    path: urlJoin(routersResourcePath, routerID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.router) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.Router(self, body.router));
  });
};


/*** 

    create router (POST)

    options:
        {
	        name: "name",
	        admin_state_up: true
        }
        or 
        a name string

***/
exports.createRouter = function (options, callback) {
  var self = this,
    router = typeof options === 'object' ? options : { 'name' : options};

  router = _convertRouterToWireFormat(router);
  var createRouterOpts = {
    method: 'POST',
    path: routersResourcePath,
    body: { 'router' : router }
  };

  self.emit('log::trace', 'Creating network', router);
  this._request(createRouterOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.Router(self, body.router));
  });
};

/***
    Update router 
    body example:
    {
        "name": "another_router",
        "external_gateway_info": {
            "network_id": "8ca37218-28ff-41cb-9b10-039601ea7e6b",
            "enable_snat": "True",
            "external_fixed_ips": [
                {
                    "subnet_id": "255.255.255.0",
                    "ip": "192.168.10.1"
                }
            ]
        },
        "admin_state_up": true
    }

***/
exports.updateRouter = function (router, callback) {
  var self = this,
  routerID = router.id,
  routerToUpdate = _convertRouterUpdateToWireFormat(router);
  var updateRouterOpts = {
    method: 'PUT',
    path: urlJoin(routersResourcePath, routerID),
    contentType: 'application/json',
    body: { 'router' : routerToUpdate }
  };
  self.emit('log::trace', 'Updating network', routerID);
  this._request(updateRouterOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.Router(self, body.router));
  });
};


/*** 

    delete router (DELETE)
    ex:
    /routers/{Router UUID}

***/

exports.destroyRouter = function (router, callback) {
  var self = this,
    routerID = router instanceof this.models.Router ? router.id : router;
  self.emit('log::trace', 'Deleting router', routerID);
  this._request({
    path: urlJoin(routersResourcePath, routerID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, routerID);
  });
};


/*** 

    add router interface (PUT)

    /v2.0/routers/​{router_id}​/add_router_interface

    put body:
    {
      "subnet_id": "a2f1f29d-571b-4533-907f-5803ab96ead1"
    }

***/
exports.addRouterInterface = function (router, callback) {
  var self = this,
  routerID = router.id,
  addIntParam = _convertAddInterfaceFormat(router);
  
  var addIntRouterOpts = {
    method: 'PUT',
    path: urlJoin(routersResourcePath, routerID+'/add_router_interface'),
    contentType: 'application/json',
    body: addIntParam 
  };

  self.emit('log::trace', 'Updating network', routerID);
  this._request(addIntRouterOpts, function (err, body) {
    debugger;
    return err
      ? callback(err)
      : callback(err, body);
  });
};


/*** 
    delete router interface (PUT)

    /v2.0/routers/​{router_id}​/remove_router_interface

    put body:
    {
      "subnet_id": "a2f1f29d-571b-4533-907f-5803ab96ead1"
    }

***/

exports.removeRouterInterface = function (router, callback) {
  var self = this,
  routerID = router.id,
  addIntParam = _convertAddInterfaceFormat(router);
  
  var addIntRouterOpts = {
    method: 'PUT',
    path: urlJoin(routersResourcePath, routerID+'/remove_router_interface'),
    contentType: 'application/json',
    body: addIntParam 
  };

  self.emit('log::trace', 'Updating network', routerID);
  this._request(addIntRouterOpts, function (err, body) {
    return err
      ? callback(err)
      : callback(err, body);
  });
};



/*_convertAddInterfaceFormat*/

_convertAddInterfaceFormat = function (details){
  var intformat = {};
  intformat.subnet_id = details.networkID;
  intformat.port_id = details.portID;
  return intformat;
};

_convertRouterUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.data.admin_state_up || true;
  wireFormat.name = details.data.name;
  if(typeof(details.data.external_gateway_info) != 'undefined')
  {
    wireFormat.external_gateway_info = details.data.external_gateway_info;
  }
  return wireFormat;
};

/**
 * _convertRouterToWireFormat
 *
 * @description convert Network instance into its wire representation.
 *
 * @param {object}     details    the Network instance.
 */
_convertRouterToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.name = details.name;
  if(typeof(details.external_gateway_info) != 'undefined')
  {
    wireFormat.external_gateway_info = details.external_gateway_info;
  }
  return wireFormat;
};
