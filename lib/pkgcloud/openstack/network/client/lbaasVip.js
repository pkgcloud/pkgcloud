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

 list vips (Get)

***/

exports.getVips  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getlbaasOpts = {
    path: urlJoin(lbaasPath, 'vips'),
  };
  this._request(getlbaasOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.vips || !(body.vips instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.vips.map(function (lbaasvip) {
      return new self.models.lbaasVip(self, lbaasvip);
    }));
  });
};

/**

  show vip

*/

exports.getVip = function (option, callback) {
  var self = this,
    vipID = option instanceof this.models.lbaasVip ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas VIP', vipID);
  this._request({
    path: urlJoin(lbaasVipPath, vipID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.vip) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.lbaasVip(self, body.vip));
  });
};


/*
  create vip
*/

exports.createVip = function (options, callback) {
  var self = this,
    vip = typeof options === 'object' ? options : { 'name' : options};

  vip_create = _convertVIPcreateToWireFormat(vip);

  var createvipOpts = {
    method: 'POST',
    path: lbaasVipPath,
    body: { 'vip' : vip_create}
  };

  self.emit('log::trace', 'Creating vip', vip);
  this._request(createvipOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasVip(self, body.vip));
  });
};


/*
  update vip
*/

/**
 * client.createNetwork
 *
 * @description create a new network
 *
 * @param {object}    options
 * @param {String}    options.name      the name of the new network
 * @param callback
 */

exports.updateVip = function (options, callback) {
  var self = this,
    vip = typeof options === 'object' ? options : { 'name' : options};

  vip_update = _convertVIPupdateToWireFormat(vip);

  var createvipOpts = {
    method: 'PUT',
    path: urlJoin(lbaasVipPath, vip.id),
    contentType: 'application/json',
    body: { 'vip' : vip_update}
  };

  self.emit('log::trace', 'Creating vip', vip);
  this._request(createvipOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasVip(self, body.vip));
  });
};


/*
  Delete VIP
*/

exports.destroyVip = function (options, callback) {
  var self = this,
    vipID = options instanceof this.models.lbaasPools ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas pool', vipID);
  this._request({
    path: urlJoin(lbaasVipPath, vipID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, vipID);
  });
};




/*
  convert update format to wire format
  {
    vip:
    {
      "name": "ooxx",
      "description": "mod vip",
      "session_persistence":{
        "type": "SOURCE_IP",    or null
      },
      "connection_limit": "100",   -1 is unlimit
      "admin_state_up": true
    }
  }
*/

_convertVIPupdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.name = details.name;
  wireFormat.description = details.description;
  wireFormat.connection_limit = details.connection_limit;
  wireFormat.admin_state_up = details.admin_state_up;
  if(typeof(details.session_persistence) != 'undefined')
  {
    wireFormat.session_persistence = details.session_persistence;
  }
  return wireFormat;
};



/*
  Convert create VIP to wire format

  {
    "vip": {
        "protocol": "HTTP",
        "name": "NewVip",
        "admin_state_up": true,
        "subnet_id": "8032909d-47a1-4715-90af-5153ffe39861",
        "pool_id": "61b1f87a-7a21-4ad3-9dda-7f81d249944f",
        "protocol_port": "80"
        "session_persistence": {
            "cookie_name": "my_cookie",
            "type": "APP_COOKIE"
        }
    }
}

session_persistence dist should include the keys listed as follows:
type:
SOURCE_IP, HTTP_COOKIE, APP_COOKIE

cookie_name:
should be app cookie name

*/

_convertVIPcreateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.name = details.name;
  wireFormat.description = details.description;
  wireFormat.subnet_id = details.subnet_id || null;
  wireFormat.protocol = details.protocol;
  wireFormat.protocol_port = details.protocol_port;
  wireFormat.pool_id = details.pool_id;
  wireFormat.admin_state_up = details.admin_state_up;
  wireFormat.connection_limit = details.connection_limit;
  if(typeof(details.session_persistence) != 'undefined')
  {
    wireFormat.session_persistence = details.session_persistence;
  }

  return wireFormat;
};




