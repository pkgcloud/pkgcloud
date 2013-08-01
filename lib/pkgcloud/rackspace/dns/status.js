/*
 * status.js: Rackspace Cloud DNS Status
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    base = require('../../core/base/model');

var Status = exports.Status = function Status(client, details) {
  base.Model.call(this, client, details);
};

utile.inherits(Status, base.Model);

/**
 * @name Status.getDetails
 *
 * @description Update the Status details for this instance
 *
 * @param {Function}    callback    handles the callback of your api call
 */
Status.prototype.getDetails = function (callback) {
  var self = this;

  var requestOptions = {
    path: '/status/' + self.id,
    qs: { showDetails: true }
  };

  self.client.request(requestOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    self._setProperties(body);
    return callback(err, self);
  });
};

Status.prototype.refresh = Status.prototype.getDetails;

/**
 * @name Status._setProperties
 *
 * @description Loads the properties of an object into this instance
 *
 * @param {Object}      details     the details to load
 */
Status.prototype._setProperties = function (details) {
  this.id = details.jobId;
  this.status = details.status;
  this.response = details.response;
  this.error = details.error;
};

