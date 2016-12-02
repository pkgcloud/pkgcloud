var urlJoin = require('url-join');

var lbaasPoolPath = '/lbaas/pools';


// Declaring variables for helper functions defined later
var _convertPoolsMonitorAssociationToWireFormat,
    _convertPoolsToWireFormat,
    _convertPoolsUpdateToWireFormat;


/***

 list pool (Get)

***/
exports.getPoolsV2  = function (options, callback) {
  var self = this;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var getPoolOpts = {
    path: lbaasPoolPath,
  };
  this._request(getPoolOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.pools || !(body.pools instanceof Array)) {
      return callback(new Error('Malformed API Response'));
    }

    return callback(err, body.pools.map(function (pools) {
      return new self.models.lbaasPoolsV2(self, pools);
    }));
  });
};

/**

  Pool show

*/
exports.getPoolV2 = function (option, callback) {
  var self = this,
    poolID = option instanceof this.models.lbaasPoolsV2 ? option.id : option;
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
    callback(err, new self.models.lbaasPoolsV2(self, body.pool));
  });
};

/**

  Pool create
  {
    "pool": {
      "admin_state_up": true,
      "description": "simple pool",
      "lb_algorithm": "ROUND_ROBIN",
      "name": "pool1",
      "protocol": "HTTP",
      "subnet_id": "6c529c2b-22b8-4eae-b722-bc6338f6d1a8"
    }
  }
**/
exports.createPoolV2 = function (options, callback) {
  var self = this,
    pool = typeof options === 'object' ? options : { 'name' : options};

  var pool_create = _convertPoolsToWireFormat(pool);

  var createPoolOpts = {
    method: 'POST',
    path: lbaasPoolPath,
    body: { 'pool' : pool_create}
  };

  self.emit('log::trace', 'Creating lbaas pool', pool);
  this._request(createPoolOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasPoolsV2(self, body.pool));
  });
};

/**
  Pool update
  {
    "admin_state_up": true,
    "description": "simple pool",
    "lb_algorithm": "ROUND_ROBIN",
    "name": "pool1",
  }
**/
exports.updatePoolV2 = function (options, callback) {
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
      : callback(err, new self.models.lbaasPoolsV2(self, body.pool));
  });
};

/*
    Pool delete

*/
exports.destroyPoolV2 = function (options, callback) {
  var self = this,
    poolID = options instanceof this.models.lbaasPoolsV2 ? options.id : options;
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

/***

 list member (Get)

***/
exports.getMembersV2 = function (options, callback) {
  var self = this;
  var poolID = options instanceof this.models.lbaasPoolsV2 ? option.id : options;
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  self.emit('log::trace', 'Getting lbaas Pool members', poolID);
  var getMemberOpts = {
    path: urlJoin(lbaasPoolPath, poolID, 'members')
  };
  this._request(getMemberOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.members || !(body.members instanceof Array)) {
      return callback(new Error('Malformed API Response'));
    }

    return callback(err, body.members.map(function (member) {
      return new self.models.lbaasMembersV2(self, member);
    }));
  });
}

/**

  Member show

*/
exports.getMemberV2 = function (option, callback) {
  var self = this;
  var poolId = option.poolId;
  var memberId = option.memberId;
  self.emit('log::trace', 'Getting details for member', memberId);
  this._request({
    path: urlJoin(lbaasPoolPath, poolID, 'members', memberId),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body ||!body.member) {
      return new Error('Malformed API Response');
    }
    callback(err, new self.models.lbaasMembersV2(self, body.member));
  });
};

/**
  Member create
  {
    "member": {
      "address": "10.0.0.22",
      "admin_state_up": true,
      "protocol_port": "90",
      "pool_id": "5a9a3e9e-d1aa-448e-af37-a70171f2a332",
      "weight": "1"
    }
  }
**/
exports.createMemberV2 = function (options, callback) {
  var self = this;
  var poolId = options.pool_id;

  var memberCreate = _convertMemberToWireFormat(options);

  var createMemberOpts = {
    method: 'POST',
    path: urlJoin(lbaasPoolPath, poolId, 'members'),
    body: { 'member' : memberCreate }
  };

  self.emit('log::trace', 'Creating lbaas pool member', memberCreate);
  this._request(createMemberOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasMembersV2(self, body.member));
  });
};

exports.updateMemberV2 = function (options, callback) {
  var self = this;
  var poolId = options.member.pool_id;
  var memberId = opetions.member.member_id;
  var memberUpdate = _convertMemberUpdateToWireFormat(options.member);

  var updateMemberOpts = {
    method: 'PUT',
    path: urlJoin(lbaasPoolPath, poolId, 'members', memberId),
    contentType: 'application/json',
    body: { 'member' : memberUpdate }
  };

  self.emit('log::trace', 'Updating lbaas pool member', memberId);
  this._request(updateMemberOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.lbaasMembersV2(self, body.member));
  });
};

exports.destroyMemberV2 = function (options, callback) {
  var self = this;
  var poolId = options.member.pool_id;
  var memberId = opetions.member.member_id;
  self.emit('log::trace', 'Deleting lbaas member', memberID);
  this._request({
    path: urlJoin(lbaasPoolPath, poolId, 'members', memberId),
    contentType: 'application/json',
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, poolID);
  });
};

/*
  Convert message format for update
*/
_convertPoolsUpdateToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.description = details.description;
  wireFormat.lb_algorithm = details.lb_algorithm || 'ROUND_ROBIN';
  wireFormat.name = details.name;
  return wireFormat;
};

/*
  Convert message format for creation

  {
    "admin_state_up": true,
    "description": "simple pool",
    "lb_algorithm": "ROUND_ROBIN",
    "name": "pool1",
    "protocol": "HTTP",
    "subnet_id": "6c529c2b-22b8-4eae-b722-bc6338f6d1a8"
  }
*/
_convertPoolsToWireFormat = function (details){
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.description = details.description;
  wireFormat.lb_algorithm = details.lb_algorithm || 'ROUND_ROBIN';
  wireFormat.listener_id = details.listener_id;
  wireFormat.name = details.name;
  wireFormat.protocol = details.protocol;
  return wireFormat;
};

_convertMemberToWireFormat = function (details) {
  var wireFormat = {};
  wireFormat.address = details.address;
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.protocol_port = details.protocol_port;
  wireFormat.weight = details.weight;
  wireFormat.subnet_id = details.subnet_id;
  return wireFormat;
};

_convertMemberUpdateToWireFormat = function (details) {
  var wireFormat = {};
  wireFormat.admin_state_up = details.admin_state_up || true;
  wireFormat.protocol_port = details.protocol_port;
  wireFormat.weight = details.weight;
  return wireFormat;
}
