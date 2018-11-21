/**
 * Created by Ali Bazlamit on 8/28/2017.
 */

var util = require('util'),
  oneandone = require('../../client'),
  _ = require('lodash');

var Client = exports.Client = function (options) {
  oneandone.Client.call(this, options);

  _.extend(this, require('./snapshots'));
};

util.inherits(Client, oneandone.Client);
