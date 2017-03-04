/*
 * account.js: Base account from which all pkgcloud account inherit from
 *
 * (C) 2017 Caio Brentano
 *
 */

var util = require('util'),
    model = require('../base/model');

var Account = exports.Account = function (client, details) {

  model.Model.call(this, client, details);
};

util.inherits(Account, model.Model);

Account.prototype.refresh = function (callback) {
  this.client.getAccount(this, callback);
};
