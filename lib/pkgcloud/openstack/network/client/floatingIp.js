/*
 * floatingIp.js: floating IP operations API
 * for Openstack networking
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var floatipResourcePath = '/floatingips';

// Declaring variables for helper functions defined later
var _convertRouterToWireFormat;


/***

 list float IPs (Get)

***/

exports.getFloatingIps  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getFloatOpts = {
    path: floatipResourcePath
  };
  this._request(getFloatOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.floatingips || !(body.floatingips instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.floatingips.map(function (floatingips) {
      return new self.models.FloatingIp(self, floatingips);
    }));
  });
};


/*** 

    show floating ip (Get)

***/

exports.getFloatingIp = function (option, callback) {
  var self = this,
    //floatingIpID = option instanceof this.models.FloatingIp ? option.id : option;
    floatingIpID = 'd501a025-cce8-4611-ab72-49d262441857';
  self.emit('log::trace', 'Getting details for floating IP', floatingIpID);
  this._request({
    path: urlJoin(floatipResourcePath, floatingIpID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.floatingip) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.FloatingIp(self, body.floatingip));
  });
};


/*** 

    create floating ip (POST)

    options:
        {
          floating_network_id: {floating_net_id},
          port_id: {port_id} (option)
        }

***/
exports.createFloatingIp = function (options, callback) {
  var self = this;
  var floatingip;
  if(typeof options === 'object')
  {
    floatingip = options;
  }else
  {
    return new Error('Malformed floating IP input');
  }

  floatingip = _convertfloatipToWireFormat(floatingip);
  var createFloatingipOpts = {
    method: 'POST',
    path: floatipResourcePath,
    body: { 'floatingip' : floatingip }
  };

  self.emit('log::trace', 'Creating floating ip', floatingip);
  this._request(createFloatingipOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.FloatingIp(self, body.floatingip));
  });
};

/**
 * client.updateFloatingIp
 *
    attach:
    {
      "port_id": "fc861431-0e6c-4842-a0ed-e2363f9bc3a8"
    }

    detach:
    {
      "port_id": null
    }

}
 */
exports.updateFloatingIp = function (options, callback) {
  var self = this,
  floatingipID = options.id,
  floatingIpToUpdate = _convertupdateToWireFormat(options);

  var updateFloatingipOpts = {
    method: 'PUT',
    path: urlJoin(floatipResourcePath, floatingipID),
    contentType: 'application/json',
    body: { 'floatingip' : floatingIpToUpdate}
  };

  self.emit('log::trace', 'Updating floating ip', floatingipID);
  this._request(updateFloatingipOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.FloatingIp(self, body.floatingip));
  });
};

/*
   client.destroyFloatingIp (DELETE)
*/


exports.destroyFloatingIp = function (options, callback) {
  var self = this,
    floatingipID = options instanceof this.models.FloatingIp ? options.id : options;
  self.emit('log::trace', 'Deleting floating IP', floatingipID);
  this._request({
    path: urlJoin(floatipResourcePath, floatingipID),
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, floatingipID);
  });
};


_convertupdateToWireFormat = function (details){
  var wireFormat = {};
  if(typeof(details.port_id) != 'undefined')
  {
    wireFormat.port_id = details.port_id;
  }else
  {
    wireFormat.port_id  = null;
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
_convertfloatipToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.floating_network_id = details.floating_network_id;
  if(typeof(details.port_id) != 'undefined')
  {
    wireFormat.port_id = details.port_id;
  }
  return wireFormat;
};

