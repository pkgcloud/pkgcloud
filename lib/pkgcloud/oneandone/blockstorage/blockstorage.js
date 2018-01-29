/**
 * Created by aajdinov on 1/26/2018.
 */

var util = require('util'),
  base = require('../../core/base');

var BlockStorage = exports.BlockStorage = function BlockStorage(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(BlockStorage, base.Model);

BlockStorage.prototype._setProperties = function (details) {
  this.id = details.id;
  var id = details.id;

  this.id = id;
  this.name = details.name;
  this.description = details.description;
  this.size = details.size;
  this.datacenter = details.datacenter;
  this.server = details.server;
  this.state = details.state;
  this.creation_date = details.creation_date;
};
