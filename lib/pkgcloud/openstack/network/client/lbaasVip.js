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

/**
 * client.createNetwork
 *
 * @description create a new network
 *
 * @param {object}    options
 * @param {String}    options.name      the name of the new network
 * @param callback
 */
/*
exports.createVip = function (options, callback) {
  var self = this,
    network = typeof options === 'object' ? options : { 'name' : options};

  network = _convertNetworkToWireFormat(network);

  var createNetworkOpts = {
    method: 'POST',
    path: networksResourcePath,
    body: { 'network' : network}
  };

  self.emit('log::trace', 'Creating network', network);
  this._request(createNetworkOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.Network(self, body.network));
  });
};
*/





