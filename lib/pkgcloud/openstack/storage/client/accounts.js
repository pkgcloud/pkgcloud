/*
 * accounts.js: Instance methods for working with accounts
 * for Openstack Object Storage
 *
 * (C) 2017 Caio Brentano
 * MIT LICENSE
 *
 */

var async = require('async'),
    _ = require('lodash');


/**
 * client.getAccount
 *
 * @description get the details for a specific account
 *
 * @param {String|object}     account     the account or accountName
 * @param callback
 */
exports.getAccount = function (account, callback) {
  var accountName = account instanceof this.models.Account ? account.name : account,
    self = this;

  this._request({
    method: 'HEAD',
    account: accountName
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    var details = _.extend({}, body, {
      name: accountName,
      count: parseInt(res.headers['x-account-container-count'], 10),
      bytes: parseInt(res.headers['x-account-bytes-used'], 10)
    });

    details.metadata = self.deserializeMetadata(self.ACCOUNT_META_PREFIX, res.headers);

    callback(null, new self.models.Account(self, details));
  });
};

/**
 * client.updateAccountMetadata
 *
 * @description Updates the metadata in the specified `account` in
 * the storage account associated with this instance.
 *
 * @param {String|object}     account     the account or accountName
 * @param callback
 */
exports.updateAccountMetadata = function (account, callback) {
  this._updateAccountMetadata(account,
    this.serializeMetadata(this.ACCOUNT_META_PREFIX, account.metadata),
    callback);
};

/**
 * client.removeAccountMetadata
 *
 * @description Removes the provided `metadata` in the specified
 * `account` in the storage account associated with this instance.
 *
 * @param {String|object}     account     the account or accountName
 * @param {object}            metadataToRemove     the metadata to remove from the account
 * @param callback
 */
exports.removeAccountMetadata = function (account, metadataToRemove, callback) {
  this._updateAccountMetadata(account,
    this.serializeMetadata(this.ACCOUNT_REMOVE_META_PREFIX, metadataToRemove),
    callback);
};

/**
 * client._updateAccountMetadata
 *
 * @description Convenience function for updating account metadata
 */
exports._updateAccountMetadata = function(account, metadata, callback) {
  var self = this;

  if (!(account instanceof self.models.Account)) {
    throw new Error('Must update an existing account instance');
  }

  var updateAccountOpts = {
    method: 'POST',
    account: account.name,
    headers: metadata
  };

  this._request(updateAccountOpts, function (err) {

    // omit our newly deleted header fields, if any
    if (!err) {
      account.metadata = _.omit(account.metadata,
        _.keys(self.deserializeMetadata(self.ACCOUNT_REMOVE_META_PREFIX, metadata)));
    }

    return err
      ? callback(err)
      : callback(null, account);
  });
};
