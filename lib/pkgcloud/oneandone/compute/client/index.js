/**
 * Created by Ali Bazlamit on 8/10/2017.
 */

var util = require('util'),
  oneandone = require('../../client'),
  _ = require('lodash');

var Client = exports.Client = function (options) {
  oneandone.Client.call(this, options);

  _.extend(this, require('./servers'));
  _.extend(this, require('./images'));
  _.extend(this, require('./flavors'));
};

util.inherits(Client, oneandone.Client);