/*
 * lbaasMembers.js: lbaas APIs
 * for Openstack network
 *
 * (C) 2015 Hopebaytech 
 *
 *  P. Hsuan
 */

var urlJoin = require('url-join');

var lbaasMemberPath = '/lb/members';


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
    path: lbaasMemberPath,
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
    path: urlJoin(lbaasMemberPath, memberID),
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


/*
  Member create

*/


exports.createMember = function (options, callback) {
  var self = this,
    member = typeof options === 'object' ? options : {};

  member_create = _convertMembercreateToWireFormat(member);

  var creatememberOpts = {
    method: 'POST',
    path: lbaasMemberPath,
    body: { 'member' : member_create}
  };

  self.emit('log::trace', 'Creating member', member);
  this._request(creatememberOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasMembers(self, body.member));
  });
};

/*
  Member update

*/
exports.updateMember = function (options, callback) {
  var self = this,
    member = typeof options === 'object' ? options : {};

  member_update = _convertMemberupdateToWireFormat(member);

  var updateMemberOpts = {
    method: 'PUT',
    path: urlJoin(lbaasMemberPath, member.id),
    contentType: 'application/json',
    body: { 'member' : member_update}
  };

  self.emit('log::trace', 'update member', member);
  this._request(updateMemberOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasMembers(self, body.member));
  });
};


/*
  Delete member
*/
exports.destroyMember = function (options, callback) {
  var self = this,
    memberID = options instanceof this.models.lbaasMembers ? options.id : options;
  self.emit('log::trace', 'Deleting lbaas member', memberID);
  this._request({
    path: urlJoin(lbaasMemberPath, memberID),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, memberID);
  });
};

/*
   Convert update to wire format
   {
      "member":{
        "pool_id":
        "weight":
        "admin_state_up":
      }
   }
*/
_convertMemberupdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.pool_id = details.pool_id || null;
  wireFormat.admin_state_up = details.admin_state_up;
  wireFormat.weight = details.weight || null;
  return wireFormat;
};

/*
  Convert create to wire format

  {
    "member":{
      "pool_id": ,
      "address": ,
      "protocol_port": ,
      "weight": ,
      "admin_state_up":
    }
  }

*/

_convertMembercreateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.pool_id = details.pool_id || null;
  wireFormat.protocol_port = details.protocol_port;
  wireFormat.address = details.address || null;
  wireFormat.admin_state_up = details.admin_state_up;
  wireFormat.weight = details.weight || null;

  return wireFormat;
};


