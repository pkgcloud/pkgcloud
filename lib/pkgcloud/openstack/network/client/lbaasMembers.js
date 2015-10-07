/*
 * lbaasMembers.js: lbaas APIs
 * for Openstack network
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var lbaasPoolPath = '/lb/members';


// Declaring variables for helper functions defined later
var _convertRouterToWireFormat;


/***

 list members (Get)

***/

exports.getMembers = function (options, callback) {
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
    else if (!body || !body.members || !(body.members instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.members.map(function (members) {
      return new self.models.lbaasMembers(self, members);
    }));
  });
};

/**

  show members

*/

exports.getMember = function (option, callback) {
  var self = this,
    memberID = option instanceof this.models.lbaasMembers ? option.id : option;
  self.emit('log::trace', 'Getting details for lbaas Pool', memberID);
  this._request({
    path: urlJoin(lbaasPoolPath, memberID),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.member) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.lbaasMembers(self, body.member));
  });
};
