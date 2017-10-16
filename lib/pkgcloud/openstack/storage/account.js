/*
 * account.js: Openstack Object Storage Account
 *
 * (C) 2017 Caio Brentano
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/storage/account'),
    _ = require('lodash');

var Account = exports.Account = function Account(client, details) {
  base.Account.call(this, client, details);
};

util.inherits(Account, base.Account);

Account.prototype.updateMetadata = function (callback) {
  this.client.updateAccountMetadata(this.account, callback);
};

Account.prototype.removeMetadata = function (metadataToRemove, callback) {
  this.client.removeAccountMetadata(this, metadataToRemove, callback);
};

Account.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.count = details.count || this.count || 0;
  this.bytes = details.bytes || this.bytes || 0;
  this.metadata = details.metadata || this.metadata || {};
};

Account.prototype.toJSON = function () {
  return _.pick(this, ['name', 'count', 'bytes', 'metadata']);
};



