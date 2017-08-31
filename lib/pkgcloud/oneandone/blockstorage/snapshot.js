/**
 * Created by Ali Bazlamit on 8/28/2017.
 */

var util = require('util'),
  base = require('../../core/base'),
  _ = require('lodash');

var Snapshot = exports.Snapshot = function Snapshot(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Snapshot, base.Model);

Snapshot.prototype._setProperties = function (details) {
  this.id = details.id;
};

Snapshot.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name']);
};





